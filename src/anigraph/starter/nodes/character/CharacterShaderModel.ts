import {StandardTexturedShaderModel} from "../../shaderModels";
import {AShaderMaterial, ATexture, ClassInterface, Color} from "../../../index";
import {BlinnPhongMaterial} from "../../../rendering/shadermodels";


enum CHARACTER_SHADER_UNIFORM_NAMES{
    characterColor="characterColor",
    characterUniform1="characterUniform1"
}

export class CharacterMaterial extends BlinnPhongMaterial{
    setCharacterColor(color:Color){
        this.setUniformColor(CHARACTER_SHADER_UNIFORM_NAMES.characterColor, color)
    }
}

export class CharacterShaderModel extends StandardTexturedShaderModel{
    ShaderMaterialClass:ClassInterface<AShaderMaterial>=CharacterMaterial;
    nMaterials:number=0;
    /**
     * Optionally you can set a texture to be used as the default for all instances of shader materials created with
     * this model
     * @type {ATexture}
     * @private
     */
    private _diffuseTexture?:ATexture;

    /**
     * Set the default diffuse texture
     * @param value
     */
    set diffuseTexture(value){this._diffuseTexture = value;}

    /**
     * Get the default diffuse texture
     * @returns {ATexture | undefined}
     */
    get diffuseTexture(){return this._diffuseTexture;}


    /**
     * Creates an instance of the character shader material using this model
     * @param diffuseTexture texture to use
     * @param characterColor color to assign this character (will be random if not specified)
     * @param addGUISpecs whether to add the individual character's GUI spec
     * @param args
     * @returns {AShaderMaterial}
     * @constructor
     */
    CreateMaterial(diffuseTexture?:ATexture, characterColor?:Color, addGUISpecs:boolean=true,...args:any[]){
        characterColor = characterColor??Color.White();

        /**
         * If a texture is provided it will be used. If not, then the default provided for this model will be used if it
         * is defined
         * @type {ATexture | undefined}
         */
        diffuseTexture =diffuseTexture??this.diffuseTexture;

        let mat = super.CreateMaterial(...args);

        characterColor = characterColor??Color.White();


        /**
         * Set the diffuse texture, characterColor, and characterUniform1 uniform values for our shader
         */
        mat.setTexture('diffuse', diffuseTexture??this.diffuseTexture);
        mat.setUniformColor("characterColor", characterColor);
        mat.setUniform("characterUniform1", Math.random());

        /**
         * We can optionally add controls for each instance of a shader material
         */
        if(addGUISpecs){
            this.addInstanceGUISpecForMaterial(mat);
        }
        return mat;
    }

    addInstanceGUISpecForMaterial(mat:AShaderMaterial, ){
        /**
         * We will only add the instance spec if you've created an instance folder in the control panel to add the
         * spec to. You create the folder using shaderModel.AddInstancesControlToGUI(folder_name?:string)
         * but don't add it here! CreateMaterial gets called for every material you create using one model. You only
         * want one folder for all the instance materials that belong to this model.
         */
        if(this.hasInstanceControlsFolderInGUI) {

            /**
             * You should have some name for your instance to appear as in the control panel
             * @type {string}
             */
            let instanceName = `C${this.nMaterials}`;

            /**
             * Here we add one color picker and one slider
             * The first two arguments to the CreateUniformXXX functions are the name of the uniform
             * and its default/initial value in the GUI. We are setting the initial value to be whatever
             * the value of our uniform is, otherwise the GUI and the uniform will start out of sync
             */
            this.addInstanceControlSpec(instanceName,
                {
                    color: mat.CreateUniformColorControl("characterColor",
                        mat.getUniformColorValue("characterColor")
                    ),
                    var1: mat.CreateUniformSliderControl("characterUniform1",
                        mat.getUniformValue("characterUniform1"), -1, 3, 0.01)
                }
            )
            this.nMaterials++;
        }
    }

}


