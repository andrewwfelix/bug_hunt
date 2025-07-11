module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    message: "Hello from Vercel!",
    welcome: "Welcome Scientist. You are aboard the derelict space station.",
    ssml: '<speak><voice name="Joanna">Welcome Scientist. You are aboard the derelict space station. The crew has been missing for weeks. Strange organic growths cover the walls. Something is hunting in the shadows. What would you like to do?</voice></speak>'
  });
}; 