/**
 * Let's define a parent class.
 */
class ParentClass{
    parentProperty:number;

    constructor(argument:number){
        this.parentProperty = argument;
    }

}

/**
 * And a child class, which will inherit and build on the properties and functions of our parent class.
 */
export class ExampleTypescriptClass extends ParentClass{

    /**
     * Define a property that is a number
     * @type {number}
     */
    childProperty:number;

    /**
     * Define a property of type number that is not initialized in the constructor. The '!' is to say "I really want to define this, and I won't be initializing it in the constructor, but don't flip out on me."
     * @type {number}
     */
    uninitializedProperty!:number;

    /**
     * Constructor for the class. Can take in argument(s).
     * @param argument
     */
    constructor(argument:number, childArgument:number){
        /*Child constructors must call the `super()` function, which is the parent constructor.*/
        super(argument);
        this.childProperty = childArgument;
    }

    /**
     * We can set our uninitialized property later on.
     * @param value
     */
    setNotInitializedProperty(value:number){
        this.uninitializedProperty = value;
    }

}
