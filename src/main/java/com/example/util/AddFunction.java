package com.example.util;

public class AddFunction {

    private AddFunction() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Returns the sum of two integers.
     *
     * @param a first operand
     * @param b second operand
     * @return a + b (follows Java int wrapping semantics on overflow)
     */
    public static int add(int a, int b) {
        return a + b;
    }
}
