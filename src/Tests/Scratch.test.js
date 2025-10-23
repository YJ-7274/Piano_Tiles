import {Vec2} from "../anigraph";
import {Mat2DH} from "../A1/math";
import {
    ArrayEqualTo,
    ArrayCloseTo,
    MatrixEqual,
    VecEqual,
    VertexArray2DCircToBeCloseTo,
    VertexArray2DToBeCloseTo
} from "./helpers/TestHelpers";
expect.extend(ArrayEqualTo);
expect.extend(ArrayCloseTo);
expect.extend(VertexArray2DToBeCloseTo);
expect.extend(MatrixEqual);
expect.extend(VecEqual);
expect.extend(VertexArray2DCircToBeCloseTo);

describe("Scratch testing", () => {

    console.log("You can easily test and log things in Scratch.test.jest")

    test("How to test that one array equals another", () => {
        expect([0,0,0,0]).ArrayEqualTo([0,0,0,0]);
    });

    test("How to test that one thing equals", () => {
        expect(1).toEqual(1);
    });
});
