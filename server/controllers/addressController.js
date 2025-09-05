import Address from "../models/Address.js";


// add address :/api/address/add
export const addAddress = async (req, res) => {
    try {
        const { address } = req.body;
        const { userId } = req;
        await Address.create({ ...address, userId });
        res.json({ success: true, message: "Address added successfully"});
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: "Failed to add address", error: error.message });
    }
};

// get address : /api/address/get
export const getAllAddresses = async (req, res) => {
    try {
        const {userId}  = req;
        const addresses = await Address.find({ userId });
        res.json({ success: true, addresses });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: "Failed to retrieve addresses", error: error.message });
    }
};
    