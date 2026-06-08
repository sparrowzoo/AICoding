package com.example.util;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class SubtractFunctionTest {

    @Test
    void shouldReturn7WhenSubtract10Minus3() {
        assertEquals(7, SubtractFunction.subtract(10, 3));
    }

    @Test
    void shouldReturnMinus2WhenSubtractMinus5MinusMinus3() {
        assertEquals(-2, SubtractFunction.subtract(-5, -3));
    }

    @Test
    void shouldReturn7WhenSubtract7Minus0() {
        assertEquals(7, SubtractFunction.subtract(7, 0));
    }

    @Test
    void shouldReturn0WhenSubtract5Minus5() {
        assertEquals(0, SubtractFunction.subtract(5, 5));
    }

    @Test
    void shouldReturn8WhenSubtract5MinusMinus3() {
        assertEquals(8, SubtractFunction.subtract(5, -3));
    }

    @Test
    void shouldReturnMinus8WhenSubtractMinus3Minus5() {
        assertEquals(-8, SubtractFunction.subtract(-3, 5));
    }

    @Test
    void shouldThrowWhenMaxValueSubtractMinus1() {
        assertThrows(ArithmeticException.class,
            () -> SubtractFunction.subtract(Integer.MAX_VALUE, -1));
    }

    @Test
    void shouldThrowWhenMinValueSubtract1() {
        assertThrows(ArithmeticException.class,
            () -> SubtractFunction.subtract(Integer.MIN_VALUE, 1));
    }

    @Test
    void shouldReturnMinValueWhen0SubtractMinValue() {
        assertEquals(Integer.MIN_VALUE, SubtractFunction.subtract(0, Integer.MIN_VALUE));
    }
}
