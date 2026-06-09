package com.example.math;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AddFunctionTest {

    @Test
    void testAddTwoPositiveIntegers() {
        assertEquals(2, AddFunction.add(1, 1));
    }

    @Test
    void testAddPositiveAndNegative() {
        assertEquals(2, AddFunction.add(5, -3));
    }

    @Test
    void testAddTwoNegativeIntegers() {
        assertEquals(-5, AddFunction.add(-2, -3));
    }

    @Test
    void testAddLargeIntegers() {
        assertEquals(3000000, AddFunction.add(1000000, 2000000));
    }

    @Test
    void testAddWithZero() {
        assertEquals(5, AddFunction.add(5, 0));
    }

    @Test
    void testAddZeroAndZero() {
        assertEquals(0, AddFunction.add(0, 0));
    }

    @Test
    void testPositiveOverflow() {
        assertThrows(ArithmeticException.class,
            () -> AddFunction.add(Integer.MAX_VALUE, 1));
    }

    @Test
    void testNegativeOverflow() {
        assertThrows(ArithmeticException.class,
            () -> AddFunction.add(Integer.MIN_VALUE, -1));
    }

    @Test
    void testFirstParamNull() {
        assertThrows(IllegalArgumentException.class,
            () -> AddFunction.add(null, 5));
    }

    @Test
    void testSecondParamNull() {
        assertThrows(IllegalArgumentException.class,
            () -> AddFunction.add(5, null));
    }
}
