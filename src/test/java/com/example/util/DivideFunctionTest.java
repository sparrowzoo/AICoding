package com.example.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DivideFunctionTest {

    @Test
    void shouldReturn5WhenDivide10By2() {
        assertEquals(5, DivideFunction.divide(10, 2));
    }

    @Test
    void shouldReturnMinus5WhenDivide10ByMinus2() {
        assertEquals(-5, DivideFunction.divide(10, -2));
    }

    @Test
    void shouldReturn0WhenDivide0By5() {
        assertEquals(0, DivideFunction.divide(0, 5));
    }

    @Test
    void shouldReturn0WhenDivide1By2() {
        assertEquals(0, DivideFunction.divide(1, 2));
    }

    @Test
    void shouldThrowArithmeticExceptionWhenDivideByZero() {
        assertThrows(ArithmeticException.class, () -> DivideFunction.divide(10, 0));
    }

    @Test
    void shouldThrowArithmeticExceptionWhenMinValueDivideByMinus1() {
        assertThrows(ArithmeticException.class, () -> DivideFunction.divide(Integer.MIN_VALUE, -1));
    }

    @Test
    void shouldReturn10WhenMinus10DivideByMinus1() {
        assertEquals(10, DivideFunction.divide(-10, -1));
    }

}
