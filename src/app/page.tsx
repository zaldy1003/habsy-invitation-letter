import { GuestRecipient } from "@/components/private-response";
import { event } from "@/config/event";
import { Corners, Ornament } from "@/components/ornaments";
import { OpenInvitation } from "@/components/invitation-interactions";

export default function CoverPage() {
  return (
    <main className="invitation cover-page">
        <section className="cover" aria-labelledby="invitation-title" data-node-id="168:350">
          <div className="mushaf-frame cover-frame">
            <Corners />
            <div className="watermark"><Ornament name="watermark" /></div>
            <p className="bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
            <div className="cover-rosette"><Ornament name="rosette" /></div>
            <p className="eyebrow cover-kicker">Undangan Khataman Al-Qur’an</p>
            <div className="diamond-divider" aria-hidden="true"><span /><i /><span /></div>
            <h1 id="invitation-title">{event.firstLine}<br />{event.lastLine}</h1>
            <p className="cover-copy">Dengan penuh rasa syukur dan kerendahan hati, kami mengundang Bapak/Ibu/Saudara(i) untuk menghadiri syukuran khatam 30 Juz Al-Qur’an putra kami.</p>
            <GuestRecipient />
            <OpenInvitation />
          </div>
        </section>

    </main>
  );
}
