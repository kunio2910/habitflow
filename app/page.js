"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, ListChecks, CalendarDays, BarChart3, Settings, Bell,
  Droplets, Dumbbell, BookOpen, Brain, Languages, NotebookPen, CandyOff,
  Moon, Flame, Clock3, TrendingUp, Plus, Check, ChevronLeft, ChevronRight,
  Trophy, Target, X, Menu, Search, Sparkles, SlidersHorizontal
} from "lucide-react";

const seedHabits = [
  { id: 1, name: "Uống 2 lít nước", detail: "2 / 2 lít", icon: "water", color: "blue", progress: 100, done: true, period: "Sáng" },
  { id: 2, name: "Tập thể dục 30 phút", detail: "30 / 30 phút", icon: "sport", color: "green", progress: 100, done: true, period: "Sáng" },
  { id: 3, name: "Đọc sách 20 trang", detail: "20 / 20 trang", icon: "book", color: "orange", progress: 100, done: true, period: "Tối" },
  { id: 4, name: "Thiền 10 phút", detail: "10 / 10 phút", icon: "brain", color: "purple", progress: 100, done: true, period: "Sáng" },
  { id: 5, name: "Học ngoại ngữ 30 phút", detail: "15 / 30 phút", icon: "language", color: "yellow", progress: 50, done: false, period: "Chiều" },
  { id: 6, name: "Viết nhật ký", detail: "Chưa thực hiện", icon: "journal", color: "slate", progress: 0, done: false, period: "Tối" },
  { id: 7, name: "Không ăn đồ ngọt", detail: "Chưa thực hiện", icon: "candy", color: "pink", progress: 0, done: false, period: "Cả ngày" },
  { id: 8, name: "Đi ngủ trước 23:00", detail: "Chưa thực hiện", icon: "moon", color: "indigo", progress: 0, done: false, period: "Tối" }
];

const IconMap = { water: Droplets, sport: Dumbbell, book: BookOpen, brain: Brain, language: Languages, journal: NotebookPen, candy: CandyOff, moon: Moon };
const nav = [
  ["Tổng quan", LayoutDashboard], ["Thói quen", ListChecks], ["Hôm nay", Sparkles],
  ["Lịch", CalendarDays], ["Báo cáo", BarChart3], ["Cài đặt", Settings]
];

function Ring({ value, size = 54 }) {
  return <div className="ring" style={{ "--p": `${value * 3.6}deg`, width: size, height: size }}><span>{value}%</span></div>;
}

function StatCard({ label, value, sub, icon: Icon, tone, ring }) {
  return <div className="stat card"><div><p>{label}</p><strong>{value}</strong><small>{sub}</small></div>{ring ? <Ring value={ring} /> : <div className={`stat-icon ${tone}`}><Icon /></div>}</div>;
}

function MiniLine() {
  return <svg className="line-chart" viewBox="0 0 420 155" preserveAspectRatio="none">
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6d4aff" stopOpacity=".22"/><stop offset="1" stopColor="#6d4aff" stopOpacity="0"/></linearGradient></defs>
    {[22,61,100,139].map(y => <line key={y} x1="35" x2="410" y1={y} y2={y} stroke="#eef0f7" />)}
    <path d="M35 112 L95 79 L155 84 L215 51 L275 32 L335 20 L400 60 L400 140 L35 140Z" fill="url(#fade)"/>
    <path d="M35 112 L95 79 L155 84 L215 51 L275 32 L335 20 L400 60" fill="none" stroke="#6541f5" strokeWidth="3"/>
    {[["35","112"],["95","79"],["155","84"],["215","51"],["275","32"],["335","20"],["400","60"]].map(([x,y])=><circle key={x} cx={x} cy={y} r="4" fill="#6541f5"/>)}
  </svg>;
}

export default function Home() {
  const [habits, setHabits] = useState(seedHabits);
  const [active, setActive] = useState("Tổng quan");
  const [filter, setFilter] = useState("Tất cả");
  const [report, setReport] = useState("Tuần");
  const [modal, setModal] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [name, setName] = useState("");
  useEffect(() => { const saved = localStorage.getItem("habitflow-habits"); if (saved) setHabits(JSON.parse(saved)); }, []);
  useEffect(() => { localStorage.setItem("habitflow-habits", JSON.stringify(habits)); }, [habits]);
  const done = habits.filter(h => h.done).length;
  const percent = Math.round(done / habits.length * 100) || 0;
  const shown = filter === "Tất cả" ? habits : habits.filter(h => filter === "Hoàn thành" ? h.done : !h.done);
  const toggle = id => setHabits(habits.map(h => h.id === id ? {...h, done: !h.done, progress: h.done ? 0 : 100, detail: h.done ? "Chưa thực hiện" : "Đã hoàn thành"} : h));
  const addHabit = e => {
    e.preventDefault();
    if (!name.trim()) return;
    setHabits([...habits, { id: Date.now(), name: name.trim(), detail: "Chưa thực hiện", icon: "water", color: "blue", progress: 0, done: false, period: "Cả ngày" }]);
    setName(""); setModal(false);
  };
  const scrollTo = label => {
    setActive(label); setMobile(false);
    const target = label === "Báo cáo" ? "reports" : label === "Lịch" ? "calendar" : label === "Hôm nay" || label === "Thói quen" ? "today" : "top";
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return <div className="app" id="top">
    <aside className={mobile ? "sidebar open" : "sidebar"}>
      <div className="brand"><span><Check /></span>Habit<span>Flow</span></div>
      <nav>{nav.map(([label, Icon]) => <button key={label} className={active === label ? "active" : ""} onClick={() => scrollTo(label)}><Icon />{label}</button>)}</nav>
      <div className="encourage"><Trophy/><strong>Bạn đang làm rất tốt!</strong><p>Hãy duy trì để đạt mục tiêu của mình nhé.</p><a>7 ngày liên tiếp</a><div><i/></div></div>
    </aside>
    {mobile && <div className="scrim" onClick={()=>setMobile(false)}/>}

    <main>
      <header>
        <button className="menu-btn" onClick={()=>setMobile(true)}><Menu/></button>
        <div className="search"><Search/><input placeholder="Tìm thói quen..."/></div>
        <button className="icon-btn"><Bell/></button>
      </header>

      <section className="hero">
        <div><span className="eyebrow">THỨ SÁU, 24 THÁNG 7</span><h1>Chào buổi sáng! <span>👋</span></h1><p>Một ngày mới để bạn tiến gần hơn đến phiên bản tốt nhất.</p></div>
        <button className="primary" onClick={()=>setModal(true)}><Plus/> Thêm thói quen</button>
      </section>

      <section className="stats">
        <StatCard label="Thói quen hoàn thành" value={`${done} / ${habits.length}`} sub="Hôm nay" ring={percent}/>
        <StatCard label="Chuỗi ngày hiện tại" value="7" sub="ngày liên tiếp" icon={Flame} tone="green"/>
        <StatCard label="Tổng hoàn thành" value="48" sub="thói quen" icon={TrendingUp} tone="blue"/>
        <StatCard label="Thời gian tập trung" value="12.5" sub="giờ" icon={Clock3} tone="orange"/>
      </section>

      <section className="dashboard-grid">
        <div className="today card" id="today">
          <div className="section-head"><div><span className="eyebrow">TIẾN ĐỘ HÔM NAY</span><h2>{percent}% hoàn thành</h2></div><div className="filters"><SlidersHorizontal/>{["Tất cả","Chưa xong","Hoàn thành"].map(f=><button className={filter===f?"selected":""} key={f} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
          <div className="progress"><i style={{width:`${percent}%`}}/></div>
          <div className="habit-list">{shown.map(h => {const I=IconMap[h.icon] || Target; return <div className="habit" key={h.id}>
            <div className={`habit-icon ${h.color}`}><I/></div><div className="habit-info"><strong>{h.name}</strong><span>{h.detail} · {h.period}</span></div>
            {h.progress > 0 && h.progress < 100 ? <Ring value={h.progress} size={44}/> : <button aria-label="Đánh dấu hoàn thành" className={h.done?"check done":"check"} onClick={()=>toggle(h.id)}>{h.done&&<Check/>}</button>}
          </div>})}</div>
          <button className="add-row" onClick={()=>setModal(true)}><Plus/> Thêm thói quen mới</button>
        </div>

        <div className="right-col">
          <div className="calendar card" id="calendar">
            <div className="section-head"><h2>Lịch</h2><button className="link">Xem đầy đủ</button></div>
            <div className="month"><ChevronLeft/><strong>Tháng 7, 2026</strong><ChevronRight/></div>
            <div className="days">{["T2","T3","T4","T5","T6","T7","CN"].map(d=><b key={d}>{d}</b>)}{[...Array(31)].map((_,i)=><span className={i+1===24?"current":""} key={i}>{i+1}</span>)}</div>
          </div>
          <div className="achievements card">
            <div className="section-head"><h2>Thành tích</h2><button className="link">Xem tất cả</button></div>
            {[["7 ngày liên tiếp","Hoàn thành thói quen 7 ngày liên tiếp","green",Flame],["Buổi sáng năng lượng","Hoàn thành tất cả thói quen buổi sáng","orange",Sparkles],["Không bỏ cuộc","Không bỏ lỡ ngày nào trong tuần","blue",Trophy]].map(([a,b,c,I])=><div className="achievement" key={a}><span className={c}><I/></span><div><strong>{a}</strong><p>{b}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="reports card" id="reports">
        <div className="section-head"><div><span className="eyebrow">PHÂN TÍCH TIẾN ĐỘ</span><h2>Báo cáo</h2></div><div className="tabs">{["Tuần","Tháng","Năm"].map(t=><button className={report===t?"selected":""} key={t} onClick={()=>setReport(t)}>{t}</button>)}</div></div>
        <div className="report-grid">
          <div className="report-card"><p>Tỷ lệ hoàn thành</p><div className="metric">78% <span>↗ 12% so với {report.toLowerCase()} trước</span></div><MiniLine/><div className="chart-labels"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span></div></div>
          <div className="report-card"><p>Hoàn thành theo thói quen</p><div className="bars">{habits.slice(0,6).map(h=><div key={h.id}><span>{h.name}</span><i><em style={{width:`${Math.max(h.progress, 28)}%`}}/></i><b>{Math.max(h.progress,28)}%</b></div>)}</div></div>
          <div className="report-card streak"><p>Chuỗi ngày dài nhất</p><div className="metric">15 ngày <span>+5 ngày so với kỷ lục trước</span></div><div className="columns">{[7,10,11,12,9,10,11,12,8,15,10,14].map((v,i)=><i key={i} style={{height:v*5}}/>)}</div></div>
          <div className="report-card"><p>Phân bố theo thời gian trong ngày</p><div className="donut-wrap"><div className="donut"/><div className="legend">{[["Sáng","35%","blue"],["Chiều","25%","green"],["Tối","30%","orange"],["Đêm","10%","purple"]].map(x=><div key={x[0]}><i className={x[2]}/><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></div></div>
        </div>
      </section>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={()=>setModal(false)}><form className="modal" onSubmit={addHabit} onMouseDown={e=>e.stopPropagation()}><button type="button" className="close" onClick={()=>setModal(false)}><X/></button><span className="modal-icon"><Target/></span><h2>Tạo thói quen mới</h2><p>Bắt đầu nhỏ, duy trì đều và tạo nên thay đổi lớn.</p><label>Tên thói quen<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ví dụ: Đi bộ 20 phút"/></label><label>Thời điểm<select><option>Cả ngày</option><option>Buổi sáng</option><option>Buổi chiều</option><option>Buổi tối</option></select></label><button className="primary wide" type="submit">Tạo thói quen</button></form></div>}
  </div>;
}
