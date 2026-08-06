import math
from typing import Literal

import sympy as sp
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator

from .parser import UnsafeExpression, parse_safe_expression

app = FastAPI(title="Engineering Math Symbolic Service", version="0.1.0")


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class EquivalenceRequest(StrictModel):
    expected: str = Field(min_length=1, max_length=500)
    actual: str = Field(min_length=1, max_length=500)
    variables: list[str] = Field(default_factory=list, max_length=8)
    domain: Literal["real", "complex"] = "real"

    @field_validator("variables")
    @classmethod
    def validate_variables(cls, values: list[str]) -> list[str]:
        if len(set(values)) != len(values) or any(not value.isidentifier() for value in values):
            raise ValueError("Variables must be unique identifiers")
        return values


class UnaryOperationRequest(StrictModel):
    expression: str = Field(min_length=1, max_length=500)
    variable: str = Field(pattern=r"^[A-Za-z_][A-Za-z0-9_]*$")
    domain: Literal["real", "complex"] = "real"


class SolveRequest(StrictModel):
    equation: str = Field(min_length=3, max_length=500)
    variable: str = Field(pattern=r"^[A-Za-z_][A-Za-z0-9_]*$")
    domain: Literal["real", "complex"] = "real"


class NumericalCompareRequest(EquivalenceRequest):
    absolute_tolerance: float = Field(default=1e-9, ge=0, le=1)
    relative_tolerance: float = Field(default=1e-7, ge=0, le=1)


class DomainRequest(StrictModel):
    expression: str = Field(min_length=1, max_length=500)
    values: dict[str, float] = Field(max_length=8)
    domain: Literal["real", "complex"] = "real"


def make_symbols(names: list[str], domain: str) -> dict[str, sp.Symbol]:
    return {name: sp.Symbol(name, real=domain == "real") for name in names}


def parse(source: str, symbols: dict[str, sp.Symbol]) -> sp.Expr:
    try:
        return parse_safe_expression(source, symbols)
    except UnsafeExpression as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


def numerical_equivalence(
    expected: sp.Expr,
    actual: sp.Expr,
    symbols: dict[str, sp.Symbol],
    absolute_tolerance: float = 1e-9,
    relative_tolerance: float = 1e-7,
) -> bool:
    sample_values = [-2.0, -0.5, 0.25, 1.0, 2.5]
    valid_samples = 0
    ordered_symbols = list(symbols.values())
    for index, base in enumerate(sample_values):
        substitutions = {
            symbol: base + variable_index * 0.37
            for variable_index, symbol in enumerate(ordered_symbols)
        }
        try:
            expected_value = complex(expected.evalf(subs=substitutions))
            actual_value = complex(actual.evalf(subs=substitutions))
        except (TypeError, ValueError, ZeroDivisionError):
            continue
        if not all(
            math.isfinite(component)
            for component in (
                expected_value.real,
                expected_value.imag,
                actual_value.real,
                actual_value.imag,
            )
        ):
            continue
        valid_samples += 1
        difference = abs(expected_value - actual_value)
        tolerance = max(absolute_tolerance, relative_tolerance * abs(expected_value))
        if difference > tolerance:
            return False
    return valid_samples >= min(3, len(sample_values))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "engine": f"sympy-{sp.__version__}"}


@app.post("/equivalence")
def equivalence(request: EquivalenceRequest) -> dict[str, object]:
    symbols = make_symbols(request.variables, request.domain)
    expected = parse(request.expected, symbols)
    actual = parse(request.actual, symbols)
    try:
        equivalent = sp.simplify(expected - actual) == 0
    except Exception:
        equivalent = False
    if equivalent:
        return {"equivalent": True, "method": "symbolic-simplification", "details": None}
    equivalent = numerical_equivalence(expected, actual, symbols)
    return {
        "equivalent": equivalent,
        "method": "numerical-sampling",
        "details": None if equivalent else "Expressions differ on deterministic samples",
    }


@app.post("/differentiate")
def differentiate(request: UnaryOperationRequest) -> dict[str, str]:
    symbols = make_symbols([request.variable], request.domain)
    expression = parse(request.expression, symbols)
    return {"result": str(sp.diff(expression, symbols[request.variable]))}


@app.post("/integrate")
def integrate(request: UnaryOperationRequest) -> dict[str, str]:
    symbols = make_symbols([request.variable], request.domain)
    expression = parse(request.expression, symbols)
    return {"result": str(sp.integrate(expression, symbols[request.variable]))}


@app.post("/solve")
def solve(request: SolveRequest) -> dict[str, list[str]]:
    if request.equation.count("=") != 1:
        raise HTTPException(status_code=422, detail="Equation must contain exactly one equals sign")
    symbols = make_symbols([request.variable], request.domain)
    left_source, right_source = request.equation.split("=", maxsplit=1)
    equation = sp.Eq(parse(left_source, symbols), parse(right_source, symbols))
    solutions = sp.solve(equation, symbols[request.variable], check=True)
    if len(solutions) > 20:
        raise HTTPException(status_code=422, detail="Too many solutions")
    return {"solutions": [str(solution) for solution in solutions]}


@app.post("/numerical-compare")
def numerical_compare(request: NumericalCompareRequest) -> dict[str, object]:
    symbols = make_symbols(request.variables, request.domain)
    expected = parse(request.expected, symbols)
    actual = parse(request.actual, symbols)
    equivalent = numerical_equivalence(
        expected,
        actual,
        symbols,
        request.absolute_tolerance,
        request.relative_tolerance,
    )
    return {"equivalent": equivalent, "method": "numerical-sampling"}


@app.post("/validate-domain")
def validate_domain(request: DomainRequest) -> dict[str, object]:
    symbols = make_symbols(list(request.values), request.domain)
    expression = parse(request.expression, symbols)
    try:
        result = complex(expression.evalf(subs={symbols[key]: value for key, value in request.values.items()}))
        valid = math.isfinite(result.real) and math.isfinite(result.imag)
        if request.domain == "real":
            valid = valid and abs(result.imag) < 1e-12
    except (TypeError, ValueError, ZeroDivisionError):
        valid = False
        result = complex(float("nan"), 0)
    return {"valid": valid, "value": result.real if valid and abs(result.imag) < 1e-12 else None}
