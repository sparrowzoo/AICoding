package com.example.util;

/**
 * Utility class providing a safe integer division function with zero-division
 * and overflow protection.
 *
 * <p>This class is not intended to be instantiated.
 */
public final class DivideFunction {

    private DivideFunction() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Returns the quotient of {@code a} divided by {@code b}.
     *
     * <p>The result is truncated toward zero. For example, {@code divide(1, 2)}
     * returns {@code 0} rather than {@code 0.5}.
     *
     * @param a dividend
     * @param b divisor
     * @return {@code a / b} (integer division, truncates toward zero)
     * @throws ArithmeticException if {@code b == 0} or overflow
     *         ({@code Integer.MIN_VALUE / -1})
     */
    public static int divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("/ by zero");
        }
        if (a == Integer.MIN_VALUE && b == -1) {
            throw new ArithmeticException("overflow");
        }
        return a / b;
    }
}
