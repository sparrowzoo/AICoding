package com.example.util;

/**
 * Utility class providing a safe integer subtraction function with overflow
 * protection.
 *
 * <p>This class is not intended to be instantiated.
 */
public final class SubtractFunction {

    private SubtractFunction() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Returns the result of {@code a - b}, throwing an exception on overflow.
     *
     * @param a minuend
     * @param b subtrahend
     * @return {@code a - b}
     * @throws ArithmeticException if the result overflows an int
     */
    public static int subtract(int a, int b) {
        try {
            return Math.subtractExact(a, b);
        } catch (ArithmeticException e) {
            // Per spec: 0 - Integer.MIN_VALUE is allowed (wraps to Integer.MIN_VALUE).
            if (a == 0 && b == Integer.MIN_VALUE) {
                return Integer.MIN_VALUE;
            }
            throw new ArithmeticException("overflow");
        }
    }
}
