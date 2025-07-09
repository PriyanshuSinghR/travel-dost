import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createProduct = async (
  name: string,
  description: string,
  images: string[],
  price: number,
  tripId: string
) => {
  const product = await stripe.products.create({
    name,
    description,
    images,
  });

  const priceObject = await stripe.prices.create({
    product: product.id,
    unit_amount: price * 100,
    currency: "inr",
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: priceObject.id, quantity: 1 }],
    metadata: { tripId },
    after_completion: {
      type: "redirect",
      redirect: {
        url: `${process.env.VITE_BASE_URL}/travel/${tripId}/success`,
      },
    },
    custom_text: {
      submit: {
        message:
          "🧪 DEMO MODE: Use test card 4242 4242 4242 4242, any future date, any CVC",
      },
    },
    billing_address_collection: "auto",
  });

  return paymentLink;
};
