const FUNCTIONS: Record<string, (...values: number[]) => number> = {
  abs: Math.abs,
  cos: Math.cos,
  exp: Math.exp,
  log: Math.log,
  max: Math.max,
  min: Math.min,
  sin: Math.sin,
  sqrt: Math.sqrt,
};

type TokenType =
  "number" | "identifier" | "operator" | "left" | "right" | "comma" | "eof";

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(source: string): Token[] {
  if (source.length > 500) {
    throw new Error("Expression is too long");
  }

  const tokens: Token[] = [];
  let index = 0;
  while (index < source.length) {
    const rest = source.slice(index);
    const whitespace = /^\s+/.exec(rest);
    if (whitespace) {
      index += whitespace[0].length;
      continue;
    }

    const number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i.exec(rest);
    if (number) {
      tokens.push({ type: "number", value: number[0] });
      index += number[0].length;
      continue;
    }

    const identifier = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (identifier) {
      tokens.push({ type: "identifier", value: identifier[0] });
      index += identifier[0].length;
      continue;
    }

    const character = source[index];
    if (character && "+-*/^".includes(character)) {
      tokens.push({ type: "operator", value: character });
    } else if (character === "(") {
      tokens.push({ type: "left", value: character });
    } else if (character === ")") {
      tokens.push({ type: "right", value: character });
    } else if (character === ",") {
      tokens.push({ type: "comma", value: character });
    } else {
      throw new Error(`Unsupported token at position ${index}`);
    }
    index += 1;
  }

  tokens.push({ type: "eof", value: "" });
  return tokens;
}

const PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "^": 3,
};

class Parser {
  private position = 0;

  public constructor(
    private readonly tokens: Token[],
    private readonly variables: Record<string, number>,
  ) {}

  public parse(): number {
    const result = this.parseExpression(0);
    if (this.current().type !== "eof") {
      throw new Error(`Unexpected token: ${this.current().value}`);
    }
    if (!Number.isFinite(result)) {
      throw new Error("Expression did not produce a finite number");
    }
    return result;
  }

  private current(): Token {
    const token = this.tokens[this.position];
    if (!token) throw new Error("Unexpected end of expression");
    return token;
  }

  private consume(): Token {
    const token = this.current();
    this.position += 1;
    return token;
  }

  private parseExpression(minimumPrecedence: number): number {
    let left = this.parsePrimary();

    while (this.current().type === "operator") {
      const operator = this.current().value;
      const precedence = PRECEDENCE[operator];
      if (precedence === undefined || precedence < minimumPrecedence) break;
      this.consume();
      const nextMinimum = operator === "^" ? precedence : precedence + 1;
      const right = this.parseExpression(nextMinimum);
      left = this.applyOperator(operator, left, right);
    }

    return left;
  }

  private parsePrimary(): number {
    const token = this.consume();
    if (token.type === "number") return Number(token.value);

    if (
      token.type === "operator" &&
      (token.value === "+" || token.value === "-")
    ) {
      const value = this.parsePrimary();
      return token.value === "-" ? -value : value;
    }

    if (token.type === "left") {
      const value = this.parseExpression(0);
      if (this.consume().type !== "right")
        throw new Error("Missing closing parenthesis");
      return value;
    }

    if (token.type === "identifier") {
      if (this.current().type === "left")
        return this.parseFunction(token.value);
      if (token.value === "pi") return Math.PI;
      if (token.value === "e") return Math.E;
      const value = this.variables[token.value];
      if (value === undefined)
        throw new Error(`Unknown variable: ${token.value}`);
      return value;
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  private parseFunction(name: string): number {
    const operation = FUNCTIONS[name];
    if (!operation) throw new Error(`Unsupported function: ${name}`);
    this.consume();
    const values: number[] = [];
    if (this.current().type !== "right") {
      do {
        values.push(this.parseExpression(0));
        if (this.current().type !== "comma") break;
        this.consume();
      } while (true);
    }
    if (this.consume().type !== "right")
      throw new Error("Missing closing parenthesis");
    if (values.length === 0) throw new Error(`${name} requires an argument`);
    return operation(...values);
  }

  private applyOperator(operator: string, left: number, right: number): number {
    switch (operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        if (right === 0) throw new Error("Division by zero");
        return left / right;
      case "^":
        return left ** right;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}

export function evaluateExpression(
  expression: string,
  variables: Record<string, number>,
): number {
  return new Parser(tokenize(expression), variables).parse();
}
