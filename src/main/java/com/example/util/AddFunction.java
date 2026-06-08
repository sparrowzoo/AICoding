package com.example.util;

/**
 * Utility class providing a safe integer addition function with positive
 * and negative overflow protection.
 *
 * <p>This class is not intended to be instantiated.
 */
public final class AddFunction {

    private AddFunction() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Returns the sum of {@code a} and {@code b}.
     *
     * <p>Overflow detection uses sign analysis: if both operands are positive
     * and the sum is negative, positive overflow occurred; if both are negative
     * and the sum is non-negative, negative overflow occurred.
     *
     * @param a first addend
     * @param b second addend
     * @return {@code a + b}
     * @throws ArithmeticException if the result overflows an {@code int}
     *         (i.e. {@code Integer.MAX_VALUE + 1} or {@code Integer.MIN_VALUE + (-1)})
     */
    public static int add(int a, int b) {
        int sum = a + b;
        // Positive overflow: a > 0, b > 0, but sum wrapped to negative
        if (a > 0 && b > 0 && sum < 0) {
            throw new ArithmeticException("overflow");
        }
        // Negative overflow: a < 0, b < 0, but sum wrapped to non-negative
        if (a < 0 && b < 0 && sum >= 0) {
            throw new ArithmeticException("overflow");
        }
        return sum;
    }
}
