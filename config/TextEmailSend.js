exports.TextEmailSend = (email, name) => {
    let mail = {  
        from: 'CHT-TV Market <adil70hamid@gmail.com>',  
        to: email,  
        subject: 'Thank you ' + name + ' for subscribing !',  
        text: 'Merci ' + name + ' de votre inscription dans CHT-TV, à partir de maintenant vous pouvez commander en toute sécurité nos produits' 
        // on peut remplacer l'attribut `text`par `html`si on veut que le cors de notre email supporte le HTML
        // html:  '<h1>This email use html</h1>'
      };

      return mail
}

exports.TextEmailSendContact = (address, name) => {
  console.log(address);
  let mail = {  
      from: address + '<adil70hamid@gmail.com>',  
      sender: address,
      to: 'adil70hamid@gmail.com',  
      subject: name + ' send you message contact',  
      html: "<p>Vous avez recu un message de la part de l'utilisateur avec l'e-mail "+address+"</p></br><p>Pour le visualiser veuillez vous connecter dans la messagerie de votre Dashboard Admin</p>"
    };

    return mail
}

exports.TextEmailSendNewresponseToUser = (address, object) => {
  let mail = {  
      from: 'CHT-TV Market <adil70hamid@gmail.com>',  
      sender: 'adil70hamid@gmail.com',
      to: address,  
      subject: "l'Admin de CHT-TV Market vous a répondu",  
      html: "<p>Vous avez recu une reponse de l'admin, concernant la discussion avec l'objet '"+object+"' </p></br><p>Pour le visualiser veuillez vous connecter dans la messagerie de votre Dashboard User (menu settings)</p>"
    };

    return mail
}

exports.TextEmailSendNewresponseToAdmin = (address, name, object) => {
  let mail = {  
      from: address + '<adil70hamid@gmail.com>',  
      sender: address,
      to: 'adil70hamid@gmail.com',  
      subject: name + ' send message contact',  
      html: "<p>Vous avez recu une reponsede l'user, concernant la discussion avec l'objet '"+object+"' </p></br><p>Pour le visualiser veuillez vous connecter dans la messagerie de votre Dashboard Admin </p>"
    };

    return mail
}