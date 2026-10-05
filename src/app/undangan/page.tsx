import { InvitationPhoto } from "@/components/invitation-photo";
import { event } from "@/config/event";
import { eventDate, eventDay, eventYear } from "@/lib/event-format";
import { Corners, Divider, Ornament } from "@/components/ornaments";
import { Countdown, Guestbook } from "@/components/invitation-interactions";

export default function InvitationPage() {
  return (
    <>
      <a className="skip-link" href="#isi-undangan">Lewati ke isi undangan</a>
      <main className="invitation invitation-content" id="atas">
        <section className="invitation-session session-opening" data-session="1" aria-label="Salam & pembuka">
        <div className="introduction section" id="isi-undangan" tabIndex={-1} aria-labelledby="intro-title" data-node-id="168:289">
          <p className="bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
          <h2 className="intro-greeting">Assalamu’alaikum<br />Warahmatullahi Wabarakatuh</h2>
          <p className="eyebrow rosette-heading" id="intro-title"><Ornament name="rosetteSmall" />Khataman Al-Qur’an<Ornament name="rosetteSmall" /></p>
          <p className="intro-quote">Dengan memohon rahmat dan ridha Allah SWT, kami mengundang Bapak/Ibu/Saudara(i) untuk hadir dalam syukuran Khataman Al-Qur’an putra tercinta kami.</p>
          <Divider />
        </div>

        <div className="profile section" aria-labelledby="participant-name" data-node-id="168:387">
          <div className="portrait-frame">
            <div className="arch-apex"><Ornament name="rosette" /></div>
            <div className="portrait-border"><div className="portrait-inner"><InvitationPhoto src="/images/habsy-portrait.png" alt="Muhammad Al-Habsy Mulfi memegang Al-Qur’an" width={1024} height={1536} sizes="244px" eager className="portrait" /></div></div>
          </div>
          <div className="profile-copy">
            <h1 id="participant-name">{event.name}</h1>
            <p>Putra ke-dua dari Bapak {event.father} &amp; Ibu {event.mother}</p>
            <div className="achievement"><Ornament name="book" /><span>Telah Menyelesaikan Pembacaan 30 Juz</span></div>
          </div>
          <Divider />
        </div>

        </section>

        <section className="invitation-session session-ceremony" data-session="2" aria-label="Waktu & tempat">
        <div className="event-details section" aria-labelledby="event-date" data-node-id="168:310">
          <p className="eyebrow event-kicker">Insya Allah akan dilaksanakan pada</p>
          <div className="day">{eventDay}</div>
          <h2 className="event-date" id="event-date">{eventDate}</h2>
          <div className="detail-rows">
            <div className="detail-row"><span className="circle-icon"><Ornament name="clock" /></span><div className="detail-content"><div className="time-heading"><h3 className="small-label">Waktu acara</h3><strong>{event.time}</strong></div></div></div>
            <div className="detail-row"><span className="circle-icon"><Ornament name="pin" /></span><div className="detail-content"><h3 className="small-label">Tempat</h3><h4>{event.venue}</h4><p className="address">{event.street}, {event.address}</p></div></div>
          </div>
        </div>

        </section>

        <section className="invitation-session session-journey" data-session="3" aria-label="Menuju silaturahmi">
        <div className="countdown-section section" aria-label="Hitung mundur acara" data-node-id="168:415"><Countdown /></div>

        <div className="location-section section" aria-labelledby="location-title" data-node-id="168:445">
          <div className="location-card">
            <h2 className="icon-heading" id="location-title"><Ornament name="location" />Petunjuk Lokasi Acara</h2>
            <a className="map-preview" href={event.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Buka lokasi ${event.venue} di Google Maps (tab baru)`}><span className="map-marker"><Ornament name="mapPin" /></span><span className="map-label">{event.venue}</span></a>
            <div className="location-address"><h3>{event.venue}</h3><p>{event.street}, {event.address}</p></div>
            <a className="button full-width" href={event.mapsUrl} target="_blank" rel="noopener noreferrer"><Ornament name="directions" />Buka Google Maps<span className="sr-only"> (tab baru)</span></a>
          </div>
        </div>

        </section>

        <section className="invitation-session session-family" data-session="4" aria-label="Tadabbur & cinta">
        <div className="memories section" aria-labelledby="memories-title" data-node-id="168:474">
          <div><p className="eyebrow">Tadabbur &amp; Cinta</p><h2 id="memories-title">Momen Kecil, Langkah Bermakna</h2></div>
          <figure><div className="memory-frame"><InvitationPhoto src="/images/habsy-family.png" alt="Muhammad Al-Habsy Mulfi bersama keluarga" width={1122} height={1402} sizes="(max-width: 480px) calc(100vw - 64px), 416px" className="memory-photo" /></div><figcaption>“Langkah awal dalam menanamkan cinta terhadap Kalamullah di tengah kehangatan dan bimbingan keluarga.”</figcaption></figure>
          <Divider />
        </div>

        </section>

        <section className="invitation-session session-blessing" data-session="5" aria-label="Doa & penutup">
        <div className="prayer-section section" aria-labelledby="prayer-title" data-node-id="168:492">
          <div className="mushaf-frame prayer-frame"><Corners /><Ornament name="prayerRosette" /><h2 className="eyebrow" id="prayer-title">Doa &amp; Harapan</h2><p className="arabic-prayer" lang="ar" dir="rtl">رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ</p><blockquote className="translation">“Ya Tuhanku, jadikanlah aku dan anak cucuku orang-orang yang tetap mendirikan shalat, ya Tuhan kami, perkenankanlah doaku.”</blockquote><p className="verse-reference">(QS. Ibrahim: 40)</p><span className="short-rule" aria-hidden="true" /><p className="family-prayer">Semoga dengan khatamnya Al-Qur’an ini menjadi lentera bagi ananda untuk terus mencintai, membaca, memahami, serta mengamalkan nilai-nilai mulia Al-Qur’an dalam setiap sendi kehidupan. Aamiin ya Rabbal &apos;Alamin.</p></div>
        </div>

        <div className="closing section" aria-label="Salam penutup" data-node-id="168:515">
          <p className="closing-copy">Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara(i) berkenan hadir untuk memberikan doa restu secara langsung kepada putra kami.</p>
          <p className="salaam">Wassalamu’alaikum Warahmatullahi<br />Wabarakatuh</p>
          <div className="signature"><p className="eyebrow">Kami yang berbahagia,</p><h2>Keluarga Bapak {event.father} &amp;<br />Ibu {event.mother}</h2><p className="signature-child">beserta ananda {event.name}</p></div>
          <Divider />
        </div>

        </section>

        <section className="invitation-session session-response" data-session="6" aria-label="Kehadiran & doa">
        <div className="guestbook-section section" aria-labelledby="guestbook-title" data-node-id="168:534"><Guestbook /></div>
        </section>

        <footer className="footer"><Divider final /><p className="eyebrow">Undangan Digital Khataman Al-Qur’an</p><p className="footer-family">Keluarga {event.father} &amp; {event.mother} • Makassar {eventYear}</p></footer>
      </main>
      
    </>
  );
}
