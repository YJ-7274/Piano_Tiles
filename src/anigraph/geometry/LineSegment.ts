import {Point2DH, Precision, V3, Vec2, Vec3} from "../index";

export class LineSegment{
    start:Vec2
    end:Vec2

    /**
     * Constructor takes a starting point and an ending point.
     * @param start
     * @param end
     */
    constructor(start:Vec2, end:Vec2){
        this.start = start;
        this.end = end;
    }

    /**
     * Returns true if the segment has nonzero length
     * @returns {boolean}
     */
    get isFinite(){
        return this.start.minus(this.end).L2()>Precision.epsilon;
    }

    /**
     * Return the homogeneous coordinate vector representation of the line (ax+by+c=0) containing the segment
     * @returns {Vec3}
     */
    get lineCoefficientVector(){
        return Point2DH(this.start).cross(Point2DH(this.end));
    }

    /**
     * Test if a given 2D point is on the line that contains this segment. Return true if it is, false if it is not.
     * Note that precision will be an issue here, as testing whether something (e.g., a distance) is zero may be
     * impractical with finite precision (i.e., numbers represented in bits). For this reason, any comparison with 0
     * should be done using the code `Precision.PEQ(value, 0)`, which will return true if the value is within some small
     * epsilon of 0.
     * @param {Vec2} point2D
     * @returns {boolean}
     */
    isPointOnExtendedLine(point2D:Vec2):boolean{
        // TODO: Replace with your code
        // throw new Error("Not Implemented")
        return Precision.PEQ(this.lineCoefficientVector.dot(Point2DH(point2D)), 0);
    }

    /**
     * Test to see if a given 2D point is on the given line segment. Return true if it is, false if it is not.
     * Points that coincide with an endpoint should be considered on the segment.
     * We recommend using your isPointOnExtendedLine inside the body of this function.
     * @param point2D
     * @returns {boolean}
     */
    isPointOnLineSegment(point2D:Vec2):boolean{
        // // TODO: Replace with your code
        // throw new Error("Not Implemented")
        if(!this.isPointOnExtendedLine(point2D)){
            return false;
        }
        // let p = V3(point2D.x,point2D.y,1);
        let ab=this.end.minus(this.start);
        let ap = point2D.minus(this.start);
        let alpha = ab.dot(ap)/ab.dot(ab);
        return (alpha>=-Precision.epsilon && alpha <=1+Precision.epsilon);
    }

    /**
     * Calculates whether there is an intersection with the provided line segment.
     * If there is an intersection, returns the location of that intersection. If not, returns undefined.
     * @param other
     * @returns {undefined | Vec2}
     */
    intersect(other:LineSegment):Vec2|undefined{
        // TODO: Replace with your code
        // throw new Error("Not Implemented")
        let lA = this.lineCoefficientVector;
        let lB = other.lineCoefficientVector;
        let ph = lA.cross(lB);
        if(Precision.PEQ(ph.z, 0)){
            if(this.isPointOnLineSegment(other.start)){
                return other.start;
            }
            if(this.isPointOnLineSegment(other.end)){
                return other.end;
            }
            if(other.isPointOnLineSegment(this.start)){
                return this.start
            }
        }

        let p = ph.Point2D;
        if(this.isPointOnLineSegment(p)){
            if(other.isPointOnLineSegment(p)){
                return p;
            }
        }
        return;
    }
}


