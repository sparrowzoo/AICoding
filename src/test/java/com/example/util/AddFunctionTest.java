package com.example.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AddFunctionTest {

    @Test
    void testAddPositive() {
        assertEquals(5, AddFunction.add(2, 3));
    }

    @Test
    void testAddNegative() {
        assertEquals(-5, AddFunction.add(-2, -3));
    }

    @Test
    void testAddZero() {
        assertEquals(3, AddFunction.add(3, 0));
    }
}
