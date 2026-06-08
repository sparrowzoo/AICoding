package com.example.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class AddFunctionTest {

    @Test
    void shouldReturn2WhenAdd1And1() {
        assertEquals(2, AddFunction.add(1, 1));
    }

    @Test
    void shouldReturn5WhenAdd0And5() {
        assertEquals(5, AddFunction.add(0, 5));
    }

    @Test
    void shouldReturn2WhenAddMinus3And5() {
        assertEquals(2, AddFunction.add(-3, 5));
    }

    @Test
    void shouldHandleMaxValueOverflow() {
        assertEquals(Integer.MIN_VALUE, AddFunction.add(Integer.MAX_VALUE, 1));
    }
}
