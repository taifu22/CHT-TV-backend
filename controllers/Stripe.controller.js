const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE_TEST);

exports.getStripe = async (req, res) => {
  const YOUR_DOMAIN = 'http://localhost:3000';

  try {
    //je déclare la variable, qui stockera un coupon en format json si existe
    let couponJson = null
    //je récupère le nom du coupon que le client a utilisé (si existe, sinon il sera null)
    const couponCode = req.body[0].price_data.product_data.metadata.reductionPricePromosCode !== (undefined || null) ? req.body[0].price_data.product_data.metadata.reductionPricePromosCode : null;
    // Récupération de tous les coupons créés depuis la dashboard stripe (toujours si l'user a utilisé un coupon)
    if (couponCode) {
      const coupons = await stripe.coupons.list();
      // Recherche du coupon par son nom par exemple PROM25, PROM15 etc...
      const coupon = coupons.data.find(c => c.name === couponCode);  
      if (coupon) {
        couponJson = coupon.id; // Utilisation de l'ID du coupon récupéré
      } else {
        throw new Error('Coupon not found');
      }
    }

    //création des options qu'on utilisera pour la session de paiement stripe, je suis redirigé vers la page de paiement de stripe
    const sessionOptions = { 
      line_items: req.body,
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    };
    //si un coupon existe (l'user l'a rentré), alors on ajoutera la key discounts, sinon on passe la commande sans coupon
    if (couponJson) {
      sessionOptions.discounts = [{ coupon: couponJson }];
    };
    //voilà on créé notre session de payment stripe, avec ou sans coupon
    const session = await stripe.checkout.sessions.create(sessionOptions);

    res.json({ id: session.id });
  } catch (error) {
    console.error('Failed to process payment:', error);
    res.status(500).send('Failed to process payment.');
  }
};