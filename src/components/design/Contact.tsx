import React, { useState } from 'react';

export default function Contact(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <section id="contact" className="rounded-lg p-6 bg-card border border-border">
      <h2 className="text-2xl font-semibold mb-3">Contact</h2>
      <p className="text-sm text-muted-foreground mb-4">For bookings, licensing, or general inquiries, send a message below or email <a href="mailto:mgmt@zacharywalkermusic.com" className="underline">mgmt@zacharywalkermusic.com</a>.</p>

      <form onSubmit={(e) => { e.preventDefault(); window.location.href = `mailto:mgmt@zacharywalkermusic.com?subject=${encodeURIComponent('Booking request from ' + name)}&body=${encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')')}`; }} className="grid grid-cols-1 gap-3 max-w-xl">
        <input className="px-3 py-2 rounded-md bg-input border border-border outline-none" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="px-3 py-2 rounded-md bg-input border border-border outline-none" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <textarea className="px-3 py-2 rounded-md bg-input border border-border outline-none" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
        <div>
          <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Send</button>
        </div>
      </form>
    </section>
  );
}
