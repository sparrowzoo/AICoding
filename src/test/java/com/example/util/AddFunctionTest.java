package com.example.util;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class AddFunctionTest {

    @Test
    void shouldReturn5WhenAdd2And3() {
        assertEquals(5, AddFunction.add(2, 3));
    }

    @Test
    void shouldReturn1WhenAddMinus2And3() {
        assertEquals(1, AddFunction.add(-2, 3));
    }

    @Test
    void shouldReturn2WhenAdd5AndMinus3() {
        assertEquals(2, AddFunction.add(5, -3));
    }

    @Test
    void shouldReturnMinus8WhenAddMinus5AndMinus3() {
        assertEquals(-8, AddFunction.add(-5, -3));
    }

    @Test
    void shouldReturn5WhenAdd0And5() {
        assertEquals(5, AddFunction.add(0, 5));
    }

    @Test
    void shouldReturnMinus3WhenAddMinus3And0() {
        assertEquals(-3, AddFunction.add(-3, 0));
    }

    @Test
    void shouldThrowArithmeticExceptionWhenPositiveOverflow() {
        assertThrows(ArithmeticException.class,
            () -> AddFunction.add(Integer.MAX_VALUE, 1));
    }

    @Test
    void shouldThrowArithmeticExceptionWhenNegativeOverflow() {
        assertThrows(ArithmeticException.class,
            () -> AddFunction.add(Integer.MIN_VALUE, -1));
    }

    @Test
    void shouldReturn0WhenAdd0And0() {
        assertEquals(0, AddFunction.add(0, 0));
    }
}
