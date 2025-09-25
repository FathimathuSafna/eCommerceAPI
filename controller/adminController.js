import Admin from "../modals/adminSchema.js";
import Restaurant from "../modals/restaurantSchema.js";

 
const adminSignup = async (req, res) => {
    const { userName } = req.body;
    try {
      const existAdmin = await Admin.findOne({ userName });
      if (existAdmin) {
        return res.status(400).json({
          msg: "Admin already exist",
        });
      } else {
        const adminDetails = await Admin.create(req.body);
        res.status(201).json({
          msg: "Admin detailes added succesfully",          
          adminDetails,
        });
      }
} catch (err) {
      res.status(400).json({
        err,
      });
    }
}

const adminLogin = async (req, res) => {
    const { userName, password } = req.body;    
    try{
        const existAdmin = await Admin.findOne({userName})
        if(!existAdmin){
            res.status(400).json({
                msg:"Admin not found"
            })
        } else if (existAdmin.passWord !== password) {
            res.status(400).json({
                msg:"Incorrect password"
            })
        } else {
            return res.status(200).json({
                msg: "login success",                
            })
        }
    } catch (err){
        console.log(err)
        res.status(400).json({  
            msg:err
        })
    }
}

const addPatients = async (req,res)=>{
    const { patientID } = req.body
    try{
        const existPatient = await Restaurant.findOne({patientID})
        if (existPatient){
            return res.status(400).json({
                msg:"Patient already exist"
            })
        }
        const patientDetails = await Patients.create(req.body)
        res.status(201).json({
            msg:"Patient details addded successfully",
            patientDetails
        })
    } catch (err) {
        res.status(400).json({
        err,
      });
    }
}

const getPatients = async(req,res)=>{
    try{
        const patientDetails = await Patients.find()
        res.status(200).json({
            msg:"Patient details fetched successfully",
            data:patientDetails
        })
    } catch(error){
        console.error("error during fetching Patients:",error)
    }
}

export {adminSignup,adminLogin,addPatients,getPatients}