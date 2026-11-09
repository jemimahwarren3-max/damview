import { useState } from 'react';
import {
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Dumbbell,
  Fish,
  GlassWater,
  Heart,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Mountain,
  Music2,
  Palmtree,
  Plus,
  Sparkles,
  Sun,
  UtensilsCrossed,
  Waves,
  X,
} from 'lucide-react';

const heroImage = 'https://images.pexels.com/photos/15272290/pexels-photo-15272290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const poolImage = 'https://images.pexels.com/photos/18884372/pexels-photo-18884372.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const diningImage = 'https://images.pexels.com/photos/10294329/pexels-photo-10294329.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const roomImage = 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const experiences = [
  { title: 'Damside Days', text: 'Slow mornings, clear water and a front-row seat to the sunset.', image: poolImage, icon: Waves, tag: '01 / WATER' },
  { title: 'Good Food, Good People', text: 'Country-style plates, cold drinks and long lunches at Dam Food Bar.', image: diningImage, icon: UtensilsCrossed, tag: '02 / TASTE' },
  { title: 'Sleep In, Stay Longer', text: 'A quiet place to land, recharge and wake up close to nature.', image: roomImage, icon: BedDouble, tag: '03 / STAY' },
];

const rooms = [
  { block: 'A Block', rooms: 'A1 — A6', price: '$25', detail: '12-hour stay' },
  { block: 'B Block', rooms: 'B1 — B6', price: '$30', detail: '12-hour stay' },
  { block: 'F Block', rooms: 'F1 — F10', price: '$35', detail: '12-hour stay', featured: true },
  { block: 'R Block', rooms: 'R1 — R10', price: '$25', detail: '12-hour stay' },
];

const activities = [
  { icon: Fish, label: 'Boat cruises' },
  { icon: Mountain, label: 'Adventure rides' },
  { icon: Dumbbell, label: 'Damview Gym' },
  { icon: Music2, label: 'Live weekends' },
];

function Brand() {
  return (
    <div className="brand-mark" aria-label="Damview Resort">
      <div className="brand-pavilion"><Palmtree size={18} strokeWidth={1.7} /><span /></div>
      <div><div className="brand-name">DAMVIEW</div><div className="brand-subtitle">RESORT</div></div>
    </div>
  );
}

function PublicSite({ onAdmin }: { onAdmin: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="site-nav">
        <a href="#top" className="nav-brand"><Brand /></a>
        <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'}>
          <a href="#stay" onClick={() => setMenuOpen(false)}>Stay</a>
          <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
          <a href="#dining" onClick={() => setMenuOpen(false)}>Eat & drink</a>
          <a href="#events" onClick={() => setMenuOpen(false)}>Functions</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Find us</a>
          <button className="mobile-book" onClick={() => { setBookingOpen(true); setMenuOpen(false); }}>Book your escape <ArrowUpRight size={16} /></button>
        </nav>
        <div className="nav-actions"><button className="staff-link" onClick={onAdmin}><LayoutDashboard size={16} /> Staff view</button><button className="book-button" onClick={() => setBookingOpen(true)}>Book your escape <ArrowUpRight size={17} /></button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button></div>
      </header>

      <main id="top">
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-shade" />
          <div className="hero-grain" />
          <div className="hero-content">
            <div className="eyebrow light"><span className="eyebrow-line" /> Chikwanha · Chitungwiza</div>
            <div className="hero-logo"><Brand /></div>
            <p className="hero-kicker">A little more life</p>
            <h1>Your escape.<br /><em>Your happy place.</em></h1>
            <p className="hero-copy">Relax by the water. Explore the outdoors.<br />Make memories that last.</p>
            <div className="hero-actions"><a className="primary-button" href="#experience">Explore Damview <ArrowUpRight size={17} /></a><button className="outline-button" onClick={() => setBookingOpen(true)}>Book your stay <CalendarDays size={17} /></button></div>
          </div>
          <div className="hero-bottom"><span>Scroll to explore</span><div className="scroll-line" /><span className="hero-location"><Sun size={15} /> Open daily · 08:00 — late</span></div>
        </section>

        <section className="welcome section-pad">
          <div className="section-kicker"><span>01</span><span className="long-line" /><span>The Damview feeling</span></div>
          <div className="welcome-grid"><div><h2>Come for the view.<br /><em>Stay for the feeling.</em></h2></div><div className="welcome-copy"><p className="lead">Set alongside the water in Chikwanha, Damview is where the city slows down and good days come easy.</p><p>From easy pool days and boat cruises to country-style food, comfortable lodges and spaces made for your biggest celebrations — this is your place to pause, play and reconnect.</p><a className="text-link" href="#experience">Discover our story <ArrowUpRight size={16} /></a></div></div>
          <div className="welcome-stats"><div><strong>32</strong><span>rooms to rest in</span></div><div><strong>7</strong><span>ways to play</span></div><div><strong>1</strong><span>very good reason to stay</span></div></div>
        </section>

        <section id="experience" className="experience-section section-pad dark-section">
          <div className="section-heading light-heading"><div><div className="section-kicker light"><span>02</span><span className="long-line" /><span>Make a day of it</span></div><h2>There is always<br /><em>something good on.</em></h2></div><p>Come for an hour or settle in for the weekend. Damview is made for making the most of right now.</p></div>
          <div className="experience-grid">{experiences.map(({ title, text, image, icon: Icon, tag }) => <article className="experience-card" key={title}><div className="card-image"><img src={image} alt={title} /><span className="card-tag">{tag}</span><div className="card-icon"><Icon size={19} /></div></div><div className="card-body"><h3>{title}</h3><p>{text}</p><a href="#contact" className="text-link light-link">Learn more <ArrowUpRight size={15} /></a></div></article>)}</div>
        </section>

        <section id="stay" className="stay-section section-pad"><div className="section-heading"><div><div className="section-kicker"><span>03</span><span className="long-line" /><span>Stay a while</span></div><h2>Rest well.<br /><em>Wake happy.</em></h2></div><p>Simple, comfortable rooms for a proper break from the everyday. Choose your block and make yourself at home.</p></div><div className="room-list">{rooms.map((room) => <article className={room.featured ? 'room-row featured-room' : 'room-row'} key={room.block}><div className="room-icon"><BedDouble size={21} /></div><div className="room-details"><h3>{room.block}</h3><span>{room.rooms} <i>·</i> {room.detail}</span></div><div className="room-price"><small>from</small><strong>{room.price}</strong></div><button className="circle-arrow" onClick={() => setBookingOpen(true)}><ArrowUpRight size={18} /></button></article>)}</div><div className="stay-footer"><span><Check size={15} /> No registration needed to book</span><button className="text-link" onClick={() => setBookingOpen(true)}>Check availability <ArrowUpRight size={16} /></button></div></section>

        <section id="dining" className="taste-section section-pad"><div className="taste-image"><img src={diningImage} alt="Warm outdoor dining at Damview" /><div className="image-note">Good food<br /><em>good people</em></div></div><div className="taste-copy"><div className="section-kicker"><span>04</span><span className="long-line" /><span>At the table</span></div><h2>Come hungry.<br /><em>Leave happy.</em></h2><p>Dam Food Bar serves country-style comfort, cold drinks and the kind of atmosphere that turns a quick bite into a whole afternoon.</p><div className="taste-list"><span><UtensilsCrossed size={17} /> Bar & restaurant</span><span><GlassWater size={17} /> Drinks & sundowners</span><span><Heart size={17} /> Made with warmth</span></div><a className="primary-button dark-button" href="#contact">See the menu <ArrowUpRight size={17} /></a></div></section>

        <section className="activity-strip section-pad"><div className="section-kicker"><span>05</span><span className="long-line" /><span>Find your fun</span></div><div className="activity-grid">{activities.map(({ icon: Icon, label }, index) => <div className="activity-item" key={label}><span className="activity-number">0{index + 1}</span><Icon size={25} strokeWidth={1.5} /><strong>{label}</strong><ArrowUpRight className="activity-arrow" size={17} /></div>)}</div></section>

        <section id="events" className="events-banner" style={{ backgroundImage: `url(${heroImage})` }}><div className="events-overlay" /><div className="events-content"><div className="eyebrow light"><span className="eyebrow-line" /> For the big days</div><h2>Make it a day<br /><em>to remember.</em></h2><p>Birthdays, weddings, conferences and family days — bring your people, we’ll bring the setting.</p><a className="outline-button" href="#contact">Plan your event <ArrowUpRight size={17} /></a></div></section>

        <section id="contact" className="contact-section section-pad"><div className="contact-grid"><div><div className="section-kicker"><span>06</span><span className="long-line" /><span>Come find us</span></div><h2>Your next good<br /><em>day is here.</em></h2><p className="contact-intro">Damview Chikwanha, Seke Road,<br />next to Zuva Service Station,<br />Chitungwiza, Zimbabwe.</p><a className="text-link" href="tel:0774446001">Get directions <ArrowUpRight size={16} /></a></div><div className="contact-card"><div className="contact-card-top"><span>Call or WhatsApp</span><MessageCircle size={20} /></div><a href="tel:0774446001">077 444 6001</a><a href="tel:0774446004">077 444 6004</a><div className="contact-hours"><Clock3 size={15} /> Open daily · 08:00 — late</div><button className="primary-button dark-button" onClick={() => setBookingOpen(true)}>Make an enquiry <ArrowUpRight size={17} /></button></div></div></section>
      </main>
      <footer className="site-footer"><Brand /><span>© 2026 Damview Resort · A little more life.</span><div><a href="#top">Instagram</a><a href="#top">WhatsApp</a><a href="#top">Back to top ↑</a></div></footer>

      {bookingOpen && <div className="modal-backdrop" onClick={() => setBookingOpen(false)}><div className="booking-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setBookingOpen(false)}><X size={19} /></button><div className="section-kicker"><span>BOOK</span><span className="long-line" /><span>Your escape starts here</span></div><h2>Let’s make<br /><em>your plans.</em></h2><p>Tell us a little about your visit and our team will confirm availability with you.</p><div className="form-grid"><label>Full name<input placeholder="Your name" /></label><label>Phone number<input placeholder="077 ..." /></label><label>Check-in date<input type="date" /></label><label>Room preference<select defaultValue=""><option value="" disabled>Choose a block</option><option>A Block · $25</option><option>B Block · $30</option><option>F Block · $35</option><option>R Block · $25</option></select></label></div><button className="primary-button dark-button full-button" onClick={() => setBookingOpen(false)}>Send booking enquiry <ArrowUpRight size={17} /></button><span className="form-note">No account needed · We’ll call to confirm your stay</span></div></div>}
    </div>
  );
}

function AdminView({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState('Home');
  const stats = [{ label: "Today's bookings", value: '08', icon: CalendarDays, tone: 'teal' }, { label: 'Pending review', value: '03', icon: Clock3, tone: 'sand' }, { label: 'Rooms occupied', value: '17', icon: BedDouble, tone: 'green' }, { label: 'Outstanding', value: '$420', icon: CircleDollarSign, tone: 'orange' }];
  const rooms = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6'];
  return <div className="admin-shell"><aside className="admin-sidebar"><button className="admin-brand" onClick={onBack}><Brand /></button><div className="admin-welcome"><span>Good morning,</span><strong>Samora.</strong></div><nav>{['Home', 'Bookings', 'Rooms', 'Payments', 'More'].map((item) => <button className={active === item ? 'active' : ''} key={item} onClick={() => setActive(item)}>{item === 'Home' ? <LayoutDashboard size={19} /> : item === 'Bookings' ? <CalendarDays size={19} /> : item === 'Rooms' ? <BedDouble size={19} /> : item === 'Payments' ? <CircleDollarSign size={19} /> : <Plus size={19} />}{item}</button>)}</nav><div className="sidebar-help"><MessageCircle size={18} /><span>Need help?</span><strong>Call owner</strong></div></aside><div className="admin-main"><header className="admin-top"><div><span className="admin-date">MONDAY, 09 NOVEMBER 2026</span><h1>{active === 'Home' ? 'Good morning, Samora' : active}</h1></div><div className="admin-user"><div className="avatar">SM</div><ChevronDown size={17} /></div></header><div className="admin-content">{active === 'Home' ? <><div className="admin-actions"><button className="admin-primary"><Plus size={18} /> New booking</button><button className="admin-secondary"><MessageCircle size={18} /> WhatsApp</button></div><div className="stat-grid">{stats.map(({ label, value, icon: Icon, tone }) => <div className={`stat-card ${tone}`} key={label}><div className="stat-icon"><Icon size={19} /></div><span>{label}</span><strong>{value}</strong></div>)}</div><div className="admin-panels"><section className="admin-panel bookings-panel"><div className="panel-heading"><div><span className="panel-eyebrow">NEEDS YOUR ATTENTION</span><h2>Today’s bookings</h2></div><button className="panel-link" onClick={() => setActive('Bookings')}>View all <ArrowUpRight size={15} /></button></div><div className="booking-table"><div className="booking-head"><span>GUEST</span><span>ROOM</span><span>STATUS</span></div>{[['Tendai Moyo', 'F2', 'Confirmed'], ['Rudo & Tinashe', 'B4', 'Pending'], ['Kudakwashe P.', 'A1', 'Confirmed'], ['Nyasha Chikono', 'R7', 'Pending']].map(([name, room, status]) => <div className="booking-line" key={name}><div className="guest"><div className="mini-avatar">{name.charAt(0)}</div><strong>{name}</strong></div><span>{room}</span><span className={status === 'Confirmed' ? 'status confirmed' : 'status pending'}>{status}</span></div>)}</div></section><section className="admin-panel rooms-panel"><div className="panel-heading"><div><span className="panel-eyebrow">LIVE INVENTORY</span><h2>Room status</h2></div><button className="panel-link" onClick={() => setActive('Rooms')}>Manage <ArrowUpRight size={15} /></button></div><div className="room-legend"><span><i className="dot available" /> Available</span><span><i className="dot occupied" /> Occupied</span></div><div className="admin-room-grid">{rooms.map((room, index) => <div className={`admin-room ${index % 4 === 0 ? 'occupied' : index % 3 === 0 ? 'reserved' : ''}`} key={room}><span>{room}</span><small>{index % 4 === 0 ? 'In use' : index % 3 === 0 ? 'Held' : 'Free'}</small></div>)}</div></section></div></> : <div className="empty-admin"><div className="empty-icon"><Sparkles size={28} /></div><h2>{active} is ready to manage</h2><p>This simple workspace keeps your resort moving without the clutter.</p><button className="admin-primary" onClick={() => setActive('Home')}>Back to home</button></div>}</div></div></div>;
}

export default function App() {
  const [admin, setAdmin] = useState(false);
  return admin ? <AdminView onBack={() => setAdmin(false)} /> : <PublicSite onAdmin={() => setAdmin(true)} />;
}
