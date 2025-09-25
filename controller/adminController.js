import Admin from "../modals/adminSchema.js";
import Restaurant from "../modals/restaurantSchema.js";
import Food from "../modals/foodSchema.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";



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
};


const adminLogin = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const existAdmin = await Admin.findOne({ userName });

    if (!existAdmin) {
      return res.status(400).json({ msg: "Admin not found" });
    }

    // Compare entered password with hashed one
    const isMatch = await bcrypt.compare(password, existAdmin.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    res.status(200).json({
      msg: "Login success",
      token: generateToken(existAdmin._id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const addRestaurants = async (req, res) => {
  const { restaurantsName } = req.body;
  try {
    const existRestaurant = await Restaurant.findOne({ restaurantsName });
    if (existRestaurant) {
      return res.status(400).json({
        msg: "Restaurant already exist",
      });
    }
    const restaurantDetails = await Restaurant.create(req.body);
    res.status(201).json({
      msg: "Restaurant details addded successfully",
      restaurantDetails,
    });
  } catch (err) {
    res.status(400).json({
      err,
    });
  }
};

const getRestaurants = async (req, res) => {
  const { id } = req.query;
  let filter = {};

  if (id) filter._id = id;
  try {
    const restaurantDetails = await Restaurant.find(filter);
    res.status(200).json({
      msg: "Restaurant details fetched successfully",
      data: restaurantDetails,
    });
  } catch (error) {
    console.error("error during fetching Restaurants:", error);
  }
};

const updateRestaurants = async (req, res) => {
  try {
    let id = req.params.id;
    const updateRestaurant = await Restaurant.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json({
      msg: "Restaurant details updated successfully",
      data: updateRestaurant,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const deleteRestaurants = async (req, res) => {
  try {
    let id = req.params.id;
    const deleteRestaurant = await Restaurant.findByIdAndDelete(id);
    res.status(201).json({
      msg: "Restaurant details deleted successfully",
      data: deleteRestaurant,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const addFoodItems = async (req, res) => {
  try {
    const foodDetails = await Food.create(req.body);
    res.status(201).json({
      msg: "Food item added successfully",
      data: foodDetails,
    });
  } catch (err) {
    res.status(400).json({
      err,
    });
  }
};

const getFoodItems = async (req, res) => {
  const { id } = req.query;
  let filter = {};
  if (id) filter._id = id;
  try {
    const foodDetails = await Food.find(filter).populate("restaurantId","restaurantsName");
    res.status(200).json({
      msg: "Food items fetched successfully",
      data: foodDetails,
    });
  } catch (err) {
    res.status(400).json({
      err
    });
  }
};

const updateFoodItems = async (req, res) => {
  try {
    let id = req.params.id;
    const updateFood = await Food.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json({
      msg: "Food item updated successfully",
      data: updateFood,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const deleteFoodItems = async (req, res) => {
  try {
    let id = req.params.id;
    const deleteFood = await Food.findByIdAndDelete(id);
    res.status(201).json({
      msg: "Food item deleted successfully",
      data: deleteFood,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};



export {
  adminSignup,
  adminLogin,
  addRestaurants,
  getRestaurants,
  updateRestaurants,
  deleteRestaurants,
  addFoodItems,
  getFoodItems,
  updateFoodItems,
  deleteFoodItems,
};
