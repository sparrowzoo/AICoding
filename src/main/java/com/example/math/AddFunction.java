package com.example.math;

public class AddFunction {

    public static int add(Integer a, Integer b) {
        if (a == null || b == null) {
            throw new IllegalArgumentException("Arguments must not be null");
        }
        return Math.addExact(a, b);
    }
}
