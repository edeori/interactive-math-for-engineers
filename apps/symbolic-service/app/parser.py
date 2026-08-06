import ast
from collections.abc import Mapping

import sympy as sp

MAX_EXPRESSION_LENGTH = 500
MAX_AST_NODES = 120
MAX_ABSOLUTE_NUMBER = 1e12

FUNCTIONS = {
    "abs": sp.Abs,
    "cos": sp.cos,
    "exp": sp.exp,
    "log": sp.log,
    "sin": sp.sin,
    "sqrt": sp.sqrt,
    "tan": sp.tan,
}


class UnsafeExpression(ValueError):
    """Raised when an input uses syntax outside the mathematical whitelist."""


def parse_safe_expression(
    source: str,
    symbols: Mapping[str, sp.Symbol],
) -> sp.Expr:
    if not source or len(source) > MAX_EXPRESSION_LENGTH:
        raise UnsafeExpression("Expression is empty or too long")
    try:
        tree = ast.parse(source, mode="eval")
    except SyntaxError as error:
        raise UnsafeExpression("Invalid expression syntax") from error
    if sum(1 for _ in ast.walk(tree)) > MAX_AST_NODES:
        raise UnsafeExpression("Expression is too complex")
    return _convert(tree.body, symbols)


def _convert(node: ast.AST, symbols: Mapping[str, sp.Symbol]) -> sp.Expr:
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        if not (-MAX_ABSOLUTE_NUMBER <= node.value <= MAX_ABSOLUTE_NUMBER):
            raise UnsafeExpression("Numeric literal is out of range")
        return sp.sympify(node.value)

    if isinstance(node, ast.Name):
        if node.id in symbols:
            return symbols[node.id]
        if node.id == "pi":
            return sp.pi
        if node.id == "e":
            return sp.E
        raise UnsafeExpression(f"Unsupported symbol: {node.id}")

    if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
        value = _convert(node.operand, symbols)
        return value if isinstance(node.op, ast.UAdd) else -value

    if isinstance(node, ast.BinOp):
        left = _convert(node.left, symbols)
        right = _convert(node.right, symbols)
        if isinstance(node.op, ast.Add):
            return left + right
        if isinstance(node.op, ast.Sub):
            return left - right
        if isinstance(node.op, ast.Mult):
            return left * right
        if isinstance(node.op, ast.Div):
            return left / right
        if isinstance(node.op, ast.Pow):
            if right.is_number and abs(float(right)) > 20:
                raise UnsafeExpression("Exponent is out of range")
            return left**right
        raise UnsafeExpression("Unsupported binary operation")

    if isinstance(node, ast.Call):
        if not isinstance(node.func, ast.Name) or node.func.id not in FUNCTIONS:
            raise UnsafeExpression("Unsupported function")
        if node.keywords or len(node.args) != 1:
            raise UnsafeExpression("Functions require exactly one positional argument")
        return FUNCTIONS[node.func.id](_convert(node.args[0], symbols))

    raise UnsafeExpression(f"Unsupported syntax: {type(node).__name__}")
