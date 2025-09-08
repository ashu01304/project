import { response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";


// place order COD : /api/order/cod

export const placeOrderCOD = async (req, res) => {
    try {
        const { items, address } = req.body;
        const { userId } = req; // Correctly get userId from middleware
        if( !address || items.length === 0){
            return res.json({ success: false, message: "Invalid data" });
        }
        let amount = await items.reduce(async(acc, item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // add tax charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({ // Use Order.create directly
            user: userId, 
            items,
            amount, 
            address,
            paymentType: "COD", 
        });
        

        return res.json({ success: true, message: "Order placed successfully" });
    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: "Error placing order" });
    }
}

// place order stripe : /api/order/stripe

export const placeOrderStripe = async (req, res) => {
    try {
        const { items, address } = req.body;
        const { userId } = req; 
        const {origin} = req.headers;
        if( !address || items.length === 0){
            return res.json({ success: false, message: "Invalid data" });
        }
        let productData = [];
        let amount = await items.reduce(async(acc, item)=>{
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            });
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // add tax charge (2%)
        amount += Math.floor(amount * 0.02);

        const order = await Order.create({ // Use Order.create directly
            user: userId, 
            items,
            amount, 
            address,
            paymentType: "Online", 
        });

        // stripe gateway initialized
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // create line items for stripe
        const lineItems = productData.map((item)=>{
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100, // amount in cents
                },
                quantity: item.quantity,
            }
        })

        // create session for payment
        const session = await stripeInstance.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId: userId.toString(),
            }
            // payment_method_types: ['card'],
        });

        return res.json({ success: true, url: session.url });
    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: "Error placing order" });
    }
}


// stripe webhooks to verify payments action : /stripe
// stripe webhooks to verify payments action : /stripe
export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error(`Webhook signature verification failed: ${error.message}`);
        // Return immediately to stop execution
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // If there's no event for some reason, stop.
    if (!event) {
        return res.status(400).send('Webhook error: No event found.');
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                });
                if (session.data.length > 0) {
                    const { orderId, userId } = session.data[0].metadata;
                    await Order.findByIdAndUpdate(orderId, { isPaid: true });
                    await User.findByIdAndUpdate(userId, { cartItems: {} });
                    console.log(`Payment successful for Order ID: ${orderId}`);
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                });
                if (session.data.length > 0) {
                    const { orderId } = session.data[0].metadata;
                    await Order.findByIdAndDelete(orderId);
                    console.log(`Payment failed. Deleted Order ID: ${orderId}`);
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error(`Error processing webhook event: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Error processing webhook.' });
    }

    res.json({ received: true });
};

// get orders by user ID : /api/order/user

export const getUserOrder = async (req, res) => {
    try {
        const { userId } = req;
        const orders = await Order.find({ 
            user: userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: "Error fetching orders" });
    }
}

// get all orders (for seller / admin) : /api/order/seller

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: "Error fetching orders" });
    }
}

