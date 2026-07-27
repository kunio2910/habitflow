"use client";

import { useEffect, useRef, useState } from "react";
import { loadDataFromGoogle, saveDataToGoogle } from "./lib/googleSheets";
import {
  LayoutDashboard, ListChecks, CalendarDays, BarChart3, Settings, Bell,
  Droplets, Dumbbell, BookOpen, Brain, Languages, NotebookPen, CandyOff,
  Moon, TrendingUp, Plus, Check, ChevronLeft, ChevronRight,
  Trophy, Target, X, Menu, Search, Sparkles, SlidersHorizontal, Goal,
  StickyNote, MoreVertical, ArrowLeft, BriefcaseBusiness, HeartPulse,
  UserRound, Grid2X2, CalendarCheck, Save,
  CircleCheckBig, Flag, Coffee, Sun, CloudMoon, PencilLine, RotateCcw,
  Database, Volume2, Trash2,
  CloudUpload, CloudDownload
} from "lucide-react";

const seedHabits = [
  { id: 1, name: "Uống 2 lít nước", detail: "2 / 2 lít", icon: "water", color: "blue", progress: 100, done: true, period: "Sáng", rate: 0, category: "Sức khỏe" },
  { id: 2, name: "Tập thể dục 30 phút", detail: "30 / 30 phút", icon: "sport", color: "green", progress: 100, done: true, period: "Chiều", rate: 0, category: "Sức khỏe" },
  { id: 3, name: "Đọc sách 20 trang", detail: "20 / 20 trang", icon: "book", color: "orange", progress: 100, done: true, period: "Tối", rate: 0, category: "Học tập" },
  { id: 4, name: "Thiền 10 phút", detail: "10 / 10 phút", icon: "brain", color: "purple", progress: 100, done: true, period: "Sáng", rate: 0, category: "Phát triển bản thân" },
  { id: 5, name: "Học ngoại ngữ 30 phút", detail: "15 / 30 phút", icon: "language", color: "yellow", progress: 50, done: false, period: "Chiều", rate: 0, category: "Học tập" },
  { id: 6, name: "Viết nhật ký", detail: "Chưa thực hiện", icon: "journal", color: "slate", progress: 0, done: false, period: "Tối", rate: 0, category: "Phát triển bản thân" },
  { id: 7, name: "Không ăn đồ ngọt", detail: "Chưa thực hiện", icon: "candy", color: "pink", progress: 0, done: false, period: "Cả ngày", rate: 0, category: "Sức khỏe" },
  { id: 8, name: "Đi ngủ trước 23:00", detail: "Chưa thực hiện", icon: "moon", color: "indigo", progress: 0, done: false, period: "Tối", rate: 0, category: "Sức khỏe" },
  { id: 9, name: "Đi bộ 8.000 bước", detail: "6.420 / 8.000 bước", icon: "sport", color: "green", progress: 80, done: false, period: "Chiều", rate: 0, category: "Sức khỏe" },
  { id: 10, name: "Ôn tập từ vựng", detail: "15 / 20 từ", icon: "language", color: "yellow", progress: 75, done: false, period: "Sáng", rate: 0, category: "Học tập" }
];

const goalsSeed = [
  { id: 1, name: "Đọc 12 cuốn sách trong năm", icon: "book", color: "orange", progress: 50, value: "6 / 12 cuốn", due: "31/12/2026" },
  { id: 2, name: "Tập thể dục 30 ngày liên tiếp", icon: "sport", color: "green", progress: 50, value: "15 / 30 ngày", due: "15/08/2026" },
  { id: 3, name: "Uống đủ 2 lít nước mỗi ngày trong 90 ngày", icon: "water", color: "blue", progress: 50, value: "45 / 90 ngày", due: "22/09/2026" },
  { id: 4, name: "Tiết kiệm 20 triệu đồng", icon: "language", color: "yellow", progress: 63, value: "12.500.000 / 20.000.000 đ", due: "31/12/2026" },
  { id: 5, name: "Chạy 100km trong tháng", icon: "sport", color: "purple", progress: 36, value: "36 / 100 km", due: "31/07/2026" }
];

const notesSeed = [
  { id: 1, title: "Điều mình biết ơn hôm nay", body: "Có một buổi sáng yên tĩnh, hoàn thành bài tập và đọc được 20 trang sách.", date: "24/07/2026", color: "purple" },
  { id: 2, title: "Bài học sau 7 ngày", body: "Chuẩn bị quần áo tập từ tối hôm trước giúp mình bắt đầu dễ dàng hơn.", date: "23/07/2026", color: "green" },
  { id: 3, title: "Kế hoạch cuối tuần", body: "Đi bộ ở công viên, tổng kết tuần và chọn cuốn sách tiếp theo.", date: "22/07/2026", color: "orange" }
];

const SAMPLE_VERSION = "habitflow-sample-v2";
const RESET_VERSION = "habitflow-reset-progress-v1";
const CURRENT_DATE = new Date();

function dateKey(value = CURRENT_DATE) {
  const date=value instanceof Date?value:new Date(CURRENT_DATE.getFullYear(),CURRENT_DATE.getMonth(),value);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function formatVietnameseDate(date, options) {
  return new Intl.DateTimeFormat("vi-VN",options).format(date);
}

function currentWeekDates(reference = CURRENT_DATE) {
  const monday=new Date(reference);
  const day=monday.getDay()||7;
  monday.setDate(monday.getDate()-day+1);
  return [...Array(7)].map((_,index)=>{
    const date=new Date(monday);
    date.setDate(monday.getDate()+index);
    return date;
  });
}

function greetingForDate(date = new Date()) {
  const hour=date.getHours();
  if(hour<12)return "Chào buổi sáng!";
  if(hour<18)return "Chào buổi chiều!";
  return "Chào buổi tối!";
}

function completedHabitsForDay(habits, completionHistory, day) {
  const ids = new Set(completionHistory[dateKey(day)] || []);
  return habits.filter(h => ids.has(h.id));
}

function totalCompletions(completionHistory) {
  return Object.values(completionHistory).reduce((total,ids)=>total+(Array.isArray(ids)?ids.length:0),0);
}

const IconMap = {
  water: Droplets, sport: Dumbbell, book: BookOpen, brain: Brain,
  language: Languages, journal: NotebookPen, candy: CandyOff, moon: Moon
};

const nav = [
  ["Tổng quan", LayoutDashboard], ["Thói quen", ListChecks], ["Hôm nay", Sparkles],
  ["Lịch", CalendarDays], ["Báo cáo", BarChart3], ["Thống kê", TrendingUp],
  ["Mục tiêu", Goal], ["Ghi chú", StickyNote], ["Cài đặt", Settings]
];

const chartValues = [52, 69, 66, 83, 95, 76, 84];
const week = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function HabitIcon({ habit, icon, color }) {
  const I = IconMap[habit?.icon || icon] || Target;
  return <span className={`habit-icon ${habit?.color || color || "purple"}`}><I /></span>;
}

function Ring({ value, size = 54 }) {
  return <div className="ring" style={{ "--p": `${value * 3.6}deg`, width: size, height: size }}><span>{value}%</span></div>;
}

function StatCard({ label, value, sub, icon: Icon, tone, ring, delta, extra }) {
  return <div className="stat card"><div><p>{label}</p><strong>{value}</strong><small>{sub} {delta && <em>{delta}</em>}</small>{extra}</div>{ring !== undefined ? <Ring value={ring} /> : Icon ? <div className={`stat-icon ${tone}`}><Icon /></div> : null}</div>;
}

function PageTitle({ eyebrow, title, text, action }) {
  return <div className="page-title">
    <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{text && <p>{text}</p>}</div>
    {action}
  </div>;
}

function SectionHead({ title, label, children }) {
  return <div className="section-head"><div>{label && <span className="eyebrow">{label}</span>}<h2>{title}</h2></div>{children}</div>;
}

function MiniLine({ values = chartValues, color = "#6741f5" }) {
  const points = values.map((v, i) => `${22 + i * 62},${144 - v * 1.18}`).join(" ");
  const area = `22,144 ${points} 394,144`;
  return <svg className="line-chart" viewBox="0 0 420 155" preserveAspectRatio="none">
    <defs><linearGradient id={`fade-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".2"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    {[25,63,101,139].map(y => <line key={y} x1="20" x2="404" y1={y} y2={y} stroke="#eef0f7" />)}
    <polygon points={area} fill={`url(#fade-${color.replace("#","")})`} />
    <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
    {values.map((v,i)=><circle key={i} cx={22+i*62} cy={144-v*1.18} r="4" fill={color}/>)}
  </svg>;
}

function Overview({ habits, completionHistory, toggle, openProgress, openAdd, setView, onSelectDate }) {
  const completedHabits=habits.filter(h=>h.done);
  const done = completedHabits.length;
  const percent = Math.round(done / habits.length * 100) || 0;
  const [filter, setFilter] = useState("Tất cả");
  const shown = filter === "Tất cả" ? habits : habits.filter(h => filter === "Hoàn thành" ? h.done : !h.done);
  return <>
    <PageTitle eyebrow={formatVietnameseDate(CURRENT_DATE,{weekday:"long",day:"numeric",month:"long"}).toUpperCase()} title={<>{greetingForDate()} <span>👋</span></>} text="Một ngày mới để bạn tiến gần hơn đến phiên bản tốt nhất." action={<button className="primary" onClick={openAdd}><Plus/> Thêm thói quen</button>}/>
    <section className="stats">
      <StatCard label="Thói quen hoàn thành" value={`${done} / ${habits.length}`} sub="Hôm nay" ring={percent} extra={completedHabits.length?<div className="completed-icons">{completedHabits.slice(0,5).map(h=><HabitIcon habit={h} key={h.id}/>)}{completedHabits.length>5&&<span>+{completedHabits.length-5}</span>}</div>:<div className="completed-icons empty">Chưa có thói quen hoàn thành</div>}/>
      <StatCard label="Tổng hoàn thành" value={totalCompletions(completionHistory)} sub="thói quen" icon={TrendingUp} tone="blue"/>
      <CalendarMini setView={setView} onSelectDate={onSelectDate}/>
    </section>
    <section className="dashboard-grid single">
      <div className="today card">
        <SectionHead title={`${percent}% hoàn thành`} label="TIẾN ĐỘ HÔM NAY">
          <div className="filters"><SlidersHorizontal/>{["Tất cả","Chưa xong","Hoàn thành"].map(f=><button className={filter===f?"selected":""} key={f} onClick={()=>setFilter(f)}>{f}</button>)}</div>
        </SectionHead>
        <div className="progress"><i style={{width:`${percent}%`}}/></div>
        <div className="habit-list">{shown.map(h => <div className="habit" key={h.id}>
          <HabitIcon habit={h}/><div className="habit-info"><strong>{h.name}</strong><span>{h.detail} · {h.period}</span></div>
          <QuickProgress habit={h} onSave={openProgress.quickSave}/>
          {h.progress > 0 && h.progress < 100 ? <button className="progress-trigger" aria-label={`Cập nhật tiến độ ${h.name}`} onClick={()=>openProgress.openModal(h)}><Ring value={h.progress} size={44}/></button> : <button aria-label={`Đánh dấu hoàn thành ${h.name}`} className={h.done?"check done":"check"} onClick={()=>toggle(h.id)}>{h.done&&<Check/>}</button>}
        </div>)}</div>
        <button className="add-row" onClick={()=>setView("Thói quen")}>Xem tất cả thói quen <ChevronRight/></button>
      </div>
    </section>
    <ReportSummary habits={habits}/>
  </>;
}

function CalendarMini({ setView, onSelectDate }) {
  const year=CURRENT_DATE.getFullYear();
  const month=CURRENT_DATE.getMonth();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const firstWeekday=(new Date(year,month,1).getDay()+6)%7;
  const dates=[...Array(daysInMonth)].map((_,index)=>new Date(year,month,index+1));
  return <div className="calendar compact card">
    <SectionHead title="Lịch"><button className="link" onClick={()=>setView("Lịch")}>Xem đầy đủ</button></SectionHead>
    <div className="compact-month">{formatVietnameseDate(CURRENT_DATE,{month:"long",year:"numeric"})}</div>
    <div className="compact-weekdays">{week.map(label=><b key={label}>{label}</b>)}</div>
    <div className="compact-days">
      {[...Array(firstWeekday)].map((_,index)=><i aria-hidden="true" key={`empty-${index}`}/>)}
      {dates.map(date=><button aria-label={`Xem thói quen hoàn thành ${formatVietnameseDate(date,{day:"numeric",month:"long"})}`} onClick={()=>onSelectDate(date)} className={dateKey(date)===dateKey()?"current":""} key={dateKey(date)}><span>{date.getDate()}</span></button>)}
    </div>
  </div>;
}

function QuickProgress({ habit, onSave }) {
  const [value,setValue]=useState(String(habit.progress||0));
  useEffect(()=>setValue(String(habit.progress||0)),[habit.progress]);
  const commit=()=>{
    const progress=Math.min(100,Math.max(0,Number(value)||0));
    setValue(String(progress));
    if(progress!==Number(habit.progress||0))onSave(habit.id,progress);
  };
  return <label className="quick-progress"><input aria-label={`Phần trăm hoàn thành ${habit.name}`} type="number" min="0" max="100" value={value} onChange={event=>setValue(event.target.value)} onBlur={commit} onKeyDown={event=>{if(event.key==="Enter"){event.preventDefault();event.currentTarget.blur()}}}/><span>%</span></label>;
}

function resetHabitRates(habits) {
  return habits.map(habit=>({...habit,rate:0}));
}

function DayDetailView({ habits, completionHistory, day, onBack }) {
  const completed=completedHabitsForDay(habits,completionHistory,day);
  const rate=Math.round((completed.length/Math.max(habits.length,1))*100);
  return <>
    <button className="back-btn" onClick={onBack}><ArrowLeft/> Quay lại Tổng quan</button>
    <PageTitle title={formatVietnameseDate(day,{day:"numeric",month:"long",year:"numeric"})} text="Những thói quen đã được hoàn thành trong ngày này."/>
    <section className="day-summary">
      <StatCard label="Đã hoàn thành" value={`${completed.length} / ${habits.length}`} sub="thói quen" ring={rate}/>
      <StatCard label="Tỷ lệ hoàn thành" value={`${rate}%`} sub="trong ngày" icon={TrendingUp} tone="blue"/>
    </section>
    <div className="day-detail card">
      <SectionHead title="Thói quen đã hoàn thành" label="NHẬT KÝ TRONG NGÀY"><span className="complete-count"><Check/> {completed.length} mục</span></SectionHead>
      {completed.length?<div className="completed-list">{completed.map(h=><div key={h.id}><HabitIcon habit={h}/><div><strong>{h.name}</strong><span>{h.category} · {h.period}</span></div><CircleCheckBig/></div>)}</div>:<div className="empty-state"><CalendarDays/><h3>Chưa có thói quen hoàn thành</h3><p>Ngày này chưa ghi nhận hoạt động nào.</p></div>}
    </div>
  </>;
}

function ReportSummary({ habits }) {
  const [report, setReport] = useState("Tuần");
  return <section className="reports card">
    <SectionHead title="Báo cáo" label="PHÂN TÍCH TIẾN ĐỘ"><div className="tabs">{["Tuần","Tháng","Năm"].map(t=><button className={report===t?"selected":""} key={t} onClick={()=>setReport(t)}>{t}</button>)}</div></SectionHead>
    <div className="report-grid">
      <div className="report-card"><p>Tỷ lệ hoàn thành</p><div className="metric">0%</div><MiniLine values={[0,0,0,0,0,0,0]}/><div className="chart-labels">{week.map(x=><span key={x}>{x}</span>)}</div></div>
      <HabitBars habits={habits}/>
      <CategoryDonut/>
    </div>
  </section>;
}

function HabitBars({ habits, title = "Hoàn thành theo thói quen" }) {
  return <div className="report-card"><p>{title}</p><div className="bars">{habits.slice(0,6).map(h=><div key={h.id}><span>{h.name}</span><i><em style={{width:`${h.rate}%`}}/></i><b>{h.rate}%</b></div>)}</div></div>;
}

function CategoryDonut() {
  return <div className="report-card"><p>Phân bố theo danh mục</p><div className="donut-wrap"><div className="donut empty"/><div className="legend">{[["Sức khỏe","0%","blue"],["Học tập","0%","green"],["Phát triển","0%","orange"],["Công việc","0%","purple"],["Khác","0%","pink"]].map(x=><div key={x[0]}><i className={x[2]}/><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></div></div>;
}

function HabitsView({ habits, openAdd, onEdit, onProgress, onDelete, query = "" }) {
  const [tab, setTab] = useState("Tất cả");
  const [menuId,setMenuId]=useState(null);
  const [pendingDelete,setPendingDelete]=useState(null);
  const labels = ["Tất cả", "Buổi sáng", "Buổi chiều", "Buổi tối"];
  const byTime = tab === "Tất cả" ? habits : habits.filter(h => h.period.toLowerCase().includes(tab.replace("Buổi ","").toLowerCase()));
  const filtered = byTime.filter(h => h.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <PageTitle title="Thói quen của tôi" text={query ? `Tìm thấy ${filtered.length} kết quả cho “${query}”.` : "Quản lý và theo dõi tất cả thói quen của bạn."} action={<button className="primary" onClick={openAdd}><Plus/> Thêm thói quen</button>}/>
    <div className="page-tabs">{labels.map(x=><button className={tab===x?"active":""} key={x} onClick={()=>setTab(x)}>{x} <span>{x==="Tất cả"?`(${habits.length})`:""}</span></button>)}</div>
    <div className="habit-cards">{filtered.map(h=><div className="habit-card card" key={h.id}>
      <HabitIcon habit={h}/><div className="habit-main"><strong>{h.name}</strong><span>Mỗi ngày · Buổi {h.period.toLowerCase()}</span></div>
      <div className="habit-meta"><span>Tỷ lệ hoàn thành<strong>{h.rate}%</strong><i><em style={{width:`${h.rate}%`}}/></i></span></div>
      <div className="habit-actions"><button aria-label={`Tùy chọn ${h.name}`} className="ghost-icon" onClick={()=>setMenuId(menuId===h.id?null:h.id)}><MoreVertical/></button>
        {menuId===h.id&&<div className="action-popover"><button className="edit-action" onClick={()=>{onProgress(h);setMenuId(null)}}><TrendingUp/> Cập nhật tiến độ</button><button className="edit-action" onClick={()=>{onEdit(h);setMenuId(null)}}><PencilLine/> Chỉnh sửa</button><button onClick={()=>{setPendingDelete(h);setMenuId(null)}}><Trash2/> Xóa thói quen</button></div>}
      </div>
    </div>)}{filtered.length===0&&<div className="empty-state card"><Search/><h3>Không tìm thấy thói quen</h3><p>Thử một từ khóa khác hoặc tạo thói quen mới.</p></div>}</div>
    {pendingDelete&&<div className="modal-backdrop" onMouseDown={()=>setPendingDelete(null)}><div className="confirm-modal card" onMouseDown={e=>e.stopPropagation()}><span className="danger-icon"><Trash2/></span><h2>Xóa thói quen?</h2><p>“{pendingDelete.name}” sẽ bị xóa khỏi danh sách và dữ liệu trên trình duyệt.</p><div><button className="secondary" onClick={()=>setPendingDelete(null)}>Hủy</button><button className="delete-button" onClick={()=>{onDelete(pendingDelete.id);setPendingDelete(null)}}><Trash2/> Xóa</button></div></div></div>}
  </>;
}

function AddHabitView({ onBack, onSave, initialHabit }) {
  const [form, setForm] = useState(initialHabit ? {
    name:initialHabit.name,
    note:initialHabit.note||"",
    category:initialHabit.category||"Sức khỏe",
    frequency:initialHabit.frequency||"Hàng ngày",
    time:initialHabit.period==="Cả ngày"?"Buổi sáng":initialHabit.period.startsWith("Buổi")?initialHabit.period:`Buổi ${initialHabit.period.toLowerCase()}`,
    reminder:initialHabit.reminder??true,
    goal:initialHabit.goal||"Số lượng",
    amount:initialHabit.amount||"1"
  } : { name:"", note:"", category:"Sức khỏe", frequency:"Hàng ngày", time:"Buổi sáng", reminder:true, goal:"Số lượng", amount:"1" });
  const set = (key, value) => setForm({...form,[key]:value});
  const categories = [["Sức khỏe",HeartPulse],["Học tập",BookOpen],["Phát triển bản thân",UserRound],["Công việc",BriefcaseBusiness],["Khác",Grid2X2]];
  return <div className="form-page">
    <button className="back-btn" onClick={onBack}><ArrowLeft/> {initialHabit?"Chỉnh sửa thói quen":"Thêm thói quen"}</button>
    <div className="form-card card">
      <h2>{initialHabit?"Chỉnh sửa thói quen":"Thêm thói quen mới"}</h2>
      <p className="form-intro">{initialHabit?"Cập nhật thông tin và lịch thực hiện của thói quen.":"Thiết lập một thói quen phù hợp với nhịp sống của bạn."}</p>
      <label>Tên thói quen<input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Ví dụ: Đọc sách 20 trang"/></label>
      <label>Mô tả (tùy chọn)<input value={form.note} onChange={e=>set("note",e.target.value)} placeholder="Ghi chú thêm về thói quen này..."/></label>
      <fieldset><legend>Danh mục</legend><div className="category-picks">{categories.map(([name,I])=><button type="button" onClick={()=>set("category",name)} className={form.category===name?"selected":""} key={name}><I/><span>{name}</span></button>)}</div></fieldset>
      <fieldset><legend>Tần suất</legend><div className="choice-row">{["Hàng ngày","Hàng tuần","Tùy chọn"].map(x=><button type="button" onClick={()=>set("frequency",x)} className={form.frequency===x?"selected":""} key={x}><CalendarCheck/>{x}</button>)}</div></fieldset>
      <fieldset><legend>Thời gian</legend><div className="time-picks">{[["Buổi sáng","05:00 - 12:00",Coffee],["Buổi chiều","12:00 - 17:00",Sun],["Buổi tối","17:00 - 21:00",CloudMoon],["Trước khi ngủ","21:00 - 05:00",Moon]].map(([a,b,I])=><button type="button" onClick={()=>set("time",a)} className={form.time===a?"selected":""} key={a}><I/><strong>{a}</strong><small>{b}</small></button>)}</div></fieldset>
      <div className="form-split"><label>Nhắc nhở<span className="switch-line"><input type="time" defaultValue="08:00"/><button type="button" className={form.reminder?"switch on":"switch"} onClick={()=>set("reminder",!form.reminder)}><i/></button></span></label><label>Ngày bắt đầu<input type="date" defaultValue={dateKey()}/></label></div>
      <fieldset><legend>Mục tiêu</legend><div className="goal-options">{["Không có mục tiêu","Số lượng","Thời gian"].map(x=><label key={x}><input type="radio" checked={form.goal===x} onChange={()=>set("goal",x)}/>{x}{x===form.goal&&x!=="Không có mục tiêu"&&<><input className="mini-input" value={form.amount} onChange={e=>set("amount",e.target.value)}/><span>{x==="Thời gian"?"phút":"lần"}</span></>}</label>)}</div></fieldset>
      <div className="form-actions"><button className="secondary" onClick={onBack}>Hủy</button><button className="primary" onClick={()=>form.name.trim()&&onSave(form)}><Save/> {initialHabit?"Lưu thay đổi":"Lưu thói quen"}</button></div>
    </div>
  </div>;
}

function CalendarView({ habits, completionHistory }) {
  const dates=currentWeekDates();
  const completedCount=dates.reduce((total,date)=>total+(completionHistory[dateKey(date)]?.length||0),0);
  const completionRate=Math.round(completedCount/Math.max(habits.length*dates.length,1)*100);
  return <>
    <PageTitle title="Lịch thói quen" text="Theo dõi mức độ duy trì của bạn theo từng ngày." action={<div className="segmented"><button className="active">Tuần</button><button>Tháng</button><button>Hôm nay</button></div>}/>
    <div className="calendar-range"><ChevronLeft/><strong>{formatVietnameseDate(dates[0],{day:"numeric",month:"long"})} - {formatVietnameseDate(dates[6],{day:"numeric",month:"long",year:"numeric"})}</strong><ChevronRight/></div>
    <div className="habit-calendar card">
      <div className="calendar-head"><span></span>{week.map((d,i)=><b className={dateKey(dates[i])===dateKey()?"today-col":""} key={d}>{d}<small>{dates[i].getDate()}/{dates[i].getMonth()+1}</small></b>)}</div>
      {habits.map(h=><div className="calendar-row" key={h.id}><div><HabitIcon habit={h}/><span>{h.name}</span></div>{dates.map(date=><span className={dateKey(date)===dateKey()?"today-col":""} key={dateKey(date)}>{completionHistory[dateKey(date)]?.includes(h.id)?<CircleCheckBig/>:<i/>}</span>)}</div>)}
    </div>
    <div className="week-summary card"><h3>Tổng quan tuần</h3><div>{[["Tỷ lệ hoàn thành",`${completionRate}%`,"Dữ liệu thực tế"],["Tổng hoàn thành",`${completedCount} / ${habits.length*dates.length}`,""]].map(([a,b,c])=><section key={a}><span>{a}</span><strong>{b}</strong><small>{c}</small></section>)}</div></div>
  </>;
}

function ReportsView({ habits }) {
  const [period,setPeriod]=useState("Tuần");
  return <>
    <PageTitle title="Báo cáo" text="Bức tranh tổng quan về hành trình xây dựng thói quen." action={<div className="tabs">{["Tuần","Tháng","Năm","Tùy chỉnh"].map(x=><button onClick={()=>setPeriod(x)} className={period===x?"selected":""} key={x}>{x}</button>)}</div>}/>
    <section className="stats report-stats">
      <StatCard label="Tỷ lệ hoàn thành trung bình" value="0%" sub=""/>
      <StatCard label="Tổng thói quen hoàn thành" value="0" sub="lần"/>
    </section>
    <div className="report-grid standalone">
      <div className="report-card card"><p>Tỷ lệ hoàn thành</p><MiniLine values={[0,0,0,0,0,0,0]}/><div className="chart-labels">{week.map(x=><span key={x}>{x}</span>)}</div></div>
      <CategoryDonut/>
      <div className="report-card card"><p>Thói quen hàng đầu</p><div className="ranking">{habits.slice(0,3).map(h=><div key={h.id}><HabitIcon habit={h}/><span>{h.name}</span><strong>0 ngày</strong></div>)}</div></div>
      <div className="report-card card"><p>Thói quen cần cải thiện</p><div className="improve">{habits.slice(-3).map(h=><div key={h.id}><HabitIcon habit={h}/><span>{h.name}</span><strong>{h.rate}%</strong><i><em style={{width:`${h.rate}%`}}/></i></div>)}</div></div>
    </div>
  </>;
}

function StatisticsView({ habits }) {
  return <>
    <PageTitle title="Thống kê" text="Phân tích chuyên sâu về nhịp độ và khung giờ hiệu quả." action={<div className="selects"><select defaultValue="all"><option value="all">Tất cả thói quen</option></select><select><option>30 ngày qua</option><option>7 ngày qua</option></select></div>}/>
    <div className="stats-grid">
      <div className="report-card card"><p>Hoàn thành theo ngày trong tuần</p><div className="vertical-bars">{week.map((label,i)=><div key={label}><i style={{height:"0%"}}/><span>{week[i]}</span></div>)}</div></div>
      <div className="report-card card"><p>Hoàn thành theo khung giờ</p><div className="heatmap">{[...Array(28)].map((_,i)=><i style={{opacity:.08}} key={i}/>)}</div><div className="heat-label"><span>06:00</span><span>12:00</span><span>17:00</span><span>21:00</span></div></div>
    </div>
  </>;
}

function GoalsView({ goals, openGoal, onEdit, onDelete }) {
  const [tab,setTab]=useState("Đang thực hiện");
  const [menuId,setMenuId]=useState(null);
  const [pendingDelete,setPendingDelete]=useState(null);
  return <>
    <PageTitle title="Mục tiêu của tôi" text="Biến những mong muốn lớn thành tiến bộ nhỏ mỗi ngày." action={<button className="primary" onClick={openGoal}><Plus/> Thêm mục tiêu</button>}/>
    <div className="page-tabs"><button className={tab==="Đang thực hiện"?"active":""} onClick={()=>setTab("Đang thực hiện")}>Đang thực hiện ({goals.length})</button><button className={tab==="Đã hoàn thành"?"active":""} onClick={()=>setTab("Đã hoàn thành")}>Đã hoàn thành (3)</button></div>
    {tab==="Đang thực hiện"?<div className="goal-list">{goals.map(g=><div className="goal-card card" key={g.id}><HabitIcon icon={g.icon} color={g.color}/><div><div className="goal-title"><strong>{g.name}</strong><div className="habit-actions"><button aria-label={`Tùy chọn mục tiêu ${g.name}`} className="ghost-icon" onClick={()=>setMenuId(menuId===g.id?null:g.id)}><MoreVertical/></button>{menuId===g.id&&<div className="action-popover"><button className="edit-action" onClick={()=>{onEdit(g);setMenuId(null)}}><PencilLine/> Chỉnh sửa</button><button onClick={()=>{setPendingDelete(g);setMenuId(null)}}><Trash2/> Xóa mục tiêu</button></div>}</div></div><span>Tiến độ <b>{g.value}</b></span><div className="goal-progress"><i style={{width:`${g.progress}%`}}/></div><footer><span>Hạn: {g.due}</span><b>{g.progress}%</b></footer></div></div>)}</div>:<div className="empty-state card"><Trophy/><h3>3 mục tiêu đã hoàn thành</h3><p>Bạn đang làm rất tốt. Hãy tiếp tục chinh phục mục tiêu tiếp theo!</p></div>}
    <div className="suggestions"><h3>Gợi ý mục tiêu cho bạn</h3>{["Thiền 30 ngày","Học 1000 từ vựng","Chạy 100km","Giảm 5kg","Ngủ trước 22:00 trong 30 ngày"].map(x=><button key={x}>{x}</button>)}</div>
    {pendingDelete&&<div className="modal-backdrop" onMouseDown={()=>setPendingDelete(null)}><div className="confirm-modal card" onMouseDown={e=>e.stopPropagation()}><span className="danger-icon"><Trash2/></span><h2>Xóa mục tiêu?</h2><p>“{pendingDelete.name}” và tiến độ hiện tại sẽ bị xóa.</p><div><button className="secondary" onClick={()=>setPendingDelete(null)}>Hủy</button><button className="delete-button" onClick={()=>{onDelete(pendingDelete.id);setPendingDelete(null)}}><Trash2/> Xóa</button></div></div></div>}
  </>;
}

function NotesView({ notes, setNotes, notify }) {
  const [editingNote,setEditingNote]=useState(null);
  const [title,setTitle]=useState("");
  const [body,setBody]=useState("");
  const openEditor=note=>{
    setEditingNote(note||{id:null});
    setTitle(note?.title||"");
    setBody(note?.body||"");
  };
  const saveNote=e=>{
    e.preventDefault();
    if(!title.trim()) return;
    if(editingNote?.id){
      setNotes(notes.map(n=>n.id===editingNote.id?{...n,title:title.trim(),body:body.trim()||"Chưa có nội dung."}:n));
      notify("Đã cập nhật ghi chú");
    }else{
      setNotes([{id:Date.now(),title:title.trim(),body:body.trim()||"Chưa có nội dung.",date:formatVietnameseDate(CURRENT_DATE,{day:"2-digit",month:"2-digit",year:"numeric"}),color:"purple"},...notes]);
      notify("Đã tạo ghi chú mới");
    }
    setTitle("");setBody("");setEditingNote(null);
  };
  return <>
    <PageTitle title="Ghi chú" text="Ghi lại suy nghĩ và những điều bạn học được mỗi ngày." action={<button className="primary" onClick={()=>openEditor(null)}><Plus/> Tạo ghi chú</button>}/>
    <div className="notes-grid">{notes.map(n=><article className={`note-card card ${n.color}`} key={n.id}><div className="note-meta"><PencilLine/><span>{n.date}</span></div><h3>{n.title}</h3><p>{n.body}</p><div className="note-actions"><button aria-label={`Chỉnh sửa ghi chú ${n.title}`} onClick={()=>openEditor(n)}><PencilLine/></button><button aria-label={`Xóa ghi chú ${n.title}`} onClick={()=>{setNotes(notes.filter(x=>x.id!==n.id));notify("Đã xóa ghi chú")}}><Trash2/></button></div></article>)}</div>
    {editingNote&&<div className="modal-backdrop" onMouseDown={()=>setEditingNote(null)}><form className="modal" onSubmit={saveNote} onMouseDown={e=>e.stopPropagation()}><button type="button" className="close" onClick={()=>setEditingNote(null)}><X/></button><span className="modal-icon"><PencilLine/></span><h2>{editingNote.id?"Chỉnh sửa ghi chú":"Tạo ghi chú"}</h2><p>{editingNote.id?"Cập nhật nội dung bạn muốn ghi nhớ.":"Lưu lại một suy nghĩ, bài học hoặc kế hoạch nhỏ."}</p><label>Tiêu đề<input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="Tiêu đề ghi chú"/></label><label>Nội dung<textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Viết điều bạn muốn ghi nhớ..."/></label><button className="primary wide" type="submit">{editingNote.id?"Lưu thay đổi":"Lưu ghi chú"}</button></form></div>}
  </>;
}

function SettingsView({ resetData, notify, theme, toggleTheme, manualSync }) {
  const [reminders,setReminders]=useState(true);
  const [sounds,setSounds]=useState(false);
  const appsScriptStatusText={
    waiting:"Đang chờ lưu thay đổi...",
    saving:"Đang tự động lưu...",
    loading:"Đang khôi phục...",
    synced:"Đã tự động lưu",
    error:"Tự động lưu thất bại"
  }[manualSync.status]||"Tự động lưu đang bật";
  const appsScriptBusy=["waiting","saving","loading"].includes(manualSync.status);
  return <>
    <PageTitle title="Cài đặt" text="Tùy chỉnh trải nghiệm HabitFlow của bạn."/>
    <div className="settings-grid">
      <section className="settings-card card"><div className="settings-icon purple"><CloudUpload/></div><div><h3>Tự động lưu bằng Apps Script</h3><p>Mọi chỉnh sửa được lưu dạng JSON sau 1,5 giây. {appsScriptStatusText}</p></div><button className="secondary" disabled={appsScriptBusy} onClick={manualSync.backup}><CloudUpload/> {manualSync.status==="saving"?"Đang lưu...":"Lưu ngay"}</button></section>
      <section className="settings-card card"><div className="settings-icon blue"><CloudDownload/></div><div><h3>Khôi phục bằng Apps Script</h3><p>Tải bản JSON gần nhất từ trang tính Storage.</p></div><button className="secondary" disabled={appsScriptBusy} onClick={manualSync.restore}><CloudDownload/> {manualSync.status==="loading"?"Đang tải...":"Khôi phục"}</button></section>
      <section className="settings-card card"><div className="settings-icon purple"><Bell/></div><div><h3>Nhắc nhở thói quen</h3><p>Nhận thông báo theo lịch bạn đã thiết lập.</p></div><button className={reminders?"switch on":"switch"} onClick={()=>{setReminders(!reminders);notify(`Đã ${reminders?"tắt":"bật"} nhắc nhở`)}}><i/></button></section>
      <section className="settings-card card"><div className="settings-icon blue"><Volume2/></div><div><h3>Âm thanh hoàn thành</h3><p>Phát âm thanh nhỏ khi bạn hoàn thành thói quen.</p></div><button className={sounds?"switch on":"switch"} onClick={()=>{setSounds(!sounds);notify(`Đã ${sounds?"tắt":"bật"} âm thanh`)}}><i/></button></section>
      <section className="settings-card card"><div className="settings-icon orange">{theme==="dark"?<Moon/>:<Sun/>}</div><div><h3>Giao diện</h3><p>{theme==="dark"?"Chế độ tối đang được sử dụng.":"Chế độ sáng đang được sử dụng."}</p></div><button className="secondary" onClick={toggleTheme}>{theme==="dark"?"Chuyển sáng":"Chuyển tối"}</button></section>
      <section className="settings-card card reset-card"><div className="settings-icon green"><Database/></div><div><h3>Dữ liệu thử nghiệm</h3><p>Khôi phục toàn bộ thói quen, mục tiêu và ghi chú mẫu.</p></div><button className="secondary danger" onClick={resetData}><RotateCcw/> Khôi phục</button></section>
    </div>
  </>;
}

function ProgressModal({ habit, close, save }) {
  const [progress,setProgress]=useState(Number(habit.progress)||0);
  const setSafeProgress=value=>setProgress(Math.min(100,Math.max(0,Number(value)||0)));
  return <div className="modal-backdrop" onMouseDown={close}><form className="modal progress-modal" onSubmit={e=>{e.preventDefault();save(progress)}} onMouseDown={e=>e.stopPropagation()}>
    <button type="button" className="close" onClick={close}><X/></button>
    <span className="modal-icon"><TrendingUp/></span>
    <h2>Cập nhật tiến độ</h2>
    <p>Điều chỉnh mức độ hoàn thành hôm nay của “{habit.name}”. Mốc 100% sẽ được ghi nhận là hoàn thành.</p>
    <div className="progress-editor">
      <Ring value={progress} size={76}/>
      <label>Phần trăm hoàn thành<div className="progress-number"><input aria-label="Phần trăm tiến độ" type="number" min="0" max="100" value={progress} onChange={e=>setSafeProgress(e.target.value)}/><span>%</span></div></label>
    </div>
    <input aria-label="Thanh tiến độ" className="progress-range" type="range" min="0" max="100" step="1" value={progress} onChange={e=>setSafeProgress(e.target.value)}/>
    <div className="milestones">{[0,25,50,75,100].map(value=><button type="button" className={progress===value?"selected":""} onClick={()=>setProgress(value)} key={value}>{value}%</button>)}</div>
    <button className="primary wide" type="submit"><Save/> Lưu tiến độ</button>
  </form></div>;
}

function GoalModal({ close, save, goal }) {
  const [name,setName]=useState(goal?.name||"");
  const [value,setValue]=useState(goal?.value||"0 / 100");
  const [progress,setProgress]=useState(goal?.progress||0);
  const [due,setDue]=useState(goal?.due?goal.due.split("/").reverse().join("-"):"2026-12-31");
  const submit=e=>{
    e.preventDefault();
    if(!name.trim())return;
    const formattedDue=due.split("-").reverse().join("/");
    save({name:name.trim(),value:value.trim()||"0 / 100",progress:Math.min(100,Math.max(0,Number(progress)||0)),due:formattedDue});
  };
  return <div className="modal-backdrop" onMouseDown={close}><form className="modal" onSubmit={submit} onMouseDown={e=>e.stopPropagation()}><button type="button" className="close" onClick={close}><X/></button><span className="modal-icon"><Flag/></span><h2>{goal?"Chỉnh sửa mục tiêu":"Thêm mục tiêu mới"}</h2><p>{goal?"Cập nhật cột mốc và tiến độ hiện tại.":"Đặt một cột mốc rõ ràng để duy trì động lực."}</p><label>Tên mục tiêu<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ví dụ: Chạy 100km trong tháng"/></label><div className="modal-split"><label>Kết quả hiện tại<input value={value} onChange={e=>setValue(e.target.value)} placeholder="Ví dụ: 36 / 100 km"/></label><label>Tiến độ (%)<input type="number" min="0" max="100" value={progress} onChange={e=>setProgress(e.target.value)}/></label></div><label>Hạn hoàn thành<input type="date" value={due} onChange={e=>setDue(e.target.value)}/></label><button className="primary wide" type="submit">{goal?"Lưu thay đổi":"Tạo mục tiêu"}</button></form></div>;
}

export default function Home() {
  const [habits, setHabits] = useState(seedHabits);
  const [completionHistory,setCompletionHistory]=useState({});
  const [goals, setGoals] = useState(goalsSeed);
  const [notes, setNotes] = useState(notesSeed);
  const [theme,setTheme]=useState("light");
  const [selectedDay,setSelectedDay]=useState(CURRENT_DATE);
  const [view, setView] = useState("Tổng quan");
  const [editingHabit,setEditingHabit]=useState(null);
  const [progressHabit,setProgressHabit]=useState(null);
  const [mobile, setMobile] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [editingGoal,setEditingGoal]=useState(null);
  const [query,setQuery]=useState("");
  const [toast,setToast]=useState("");
  const [hydrated,setHydrated]=useState(false);
  const [manualSyncStatus,setManualSyncStatus]=useState("");
  const [appsScriptReady,setAppsScriptReady]=useState(false);
  const appsScriptSnapshotRef=useRef(null);
  const appsScriptDirtyRef=useRef(false);

  useEffect(() => {
    const read=(key,fallback)=>{
      try {
        const value=JSON.parse(localStorage.getItem(key));
        return Array.isArray(value)?value:fallback;
      } catch { return fallback; }
    };
    const readObject=(key,fallback)=>{
      try {
        const value=JSON.parse(localStorage.getItem(key));
        return value&&typeof value==="object"&&!Array.isArray(value)?value:fallback;
      } catch { return fallback; }
    };
    const existingHabits=read("habitflow-habits",seedHabits);
    const normalizedHabits=resetHabitRates(existingHabits);
    if(localStorage.getItem("habitflow-sample-version")!==SAMPLE_VERSION){
      const ids=new Set(normalizedHabits.map(h=>h.id));
      setHabits([...normalizedHabits,...seedHabits.filter(h=>!ids.has(h.id))]);
      localStorage.setItem("habitflow-sample-version",SAMPLE_VERSION);
    } else setHabits(normalizedHabits);
    const storedHistory=readObject("habitflow-completion-history",null);
    setCompletionHistory(storedHistory||{[dateKey()]:normalizedHabits.filter(h=>h.done).map(h=>h.id)});
    setGoals(read("habitflow-goals",goalsSeed));
    setNotes(read("habitflow-notes",notesSeed));
    localStorage.removeItem("habitflow-achievements");
    setTheme(localStorage.getItem("habitflow-theme")==="dark"?"dark":"light");
    setHydrated(true);
  }, []);
  useEffect(() => { if(hydrated)localStorage.setItem("habitflow-habits", JSON.stringify(habits)); }, [habits,hydrated]);
  useEffect(() => { if(hydrated)localStorage.setItem("habitflow-completion-history", JSON.stringify(completionHistory)); }, [completionHistory,hydrated]);
  useEffect(() => { if(hydrated)localStorage.setItem("habitflow-goals", JSON.stringify(goals)); }, [goals,hydrated]);
  useEffect(() => { if(hydrated)localStorage.setItem("habitflow-notes", JSON.stringify(notes)); }, [notes,hydrated]);
  useEffect(() => {
    document.body.classList.toggle("dark-mode",theme==="dark");
    if(hydrated)localStorage.setItem("habitflow-theme",theme);
  },[theme,hydrated]);
  useEffect(() => {
    if(!hydrated)return;

    let cancelled=false;
    const initialize=async()=>{
      try{
        setManualSyncStatus("loading");
        const data=await loadDataFromGoogle();
        if(cancelled)return;

        if(data){
          appsScriptSnapshotRef.current=JSON.stringify(data);
          if(Array.isArray(data.habits))setHabits(resetHabitRates(data.habits));
          if(data.completionHistory&&typeof data.completionHistory==="object"&&!Array.isArray(data.completionHistory))setCompletionHistory(data.completionHistory);
          if(Array.isArray(data.goals))setGoals(data.goals);
          if(Array.isArray(data.notes))setNotes(data.notes);
          if(data.theme==="light"||data.theme==="dark")setTheme(data.theme);
        }else{
          appsScriptSnapshotRef.current=JSON.stringify({version:1,habits,completionHistory,goals,notes,theme});
        }

        appsScriptDirtyRef.current=false;
        setAppsScriptReady(true);
        setManualSyncStatus("synced");
      }catch(error){
        if(cancelled)return;
        console.error("Không thể tải dữ liệu ban đầu từ Apps Script:",error);
        setManualSyncStatus("error");
      }
    };

    initialize();
    return()=>{cancelled=true};
  },[hydrated]);
  useEffect(() => {
    if(!hydrated||!appsScriptReady)return;

    const data={version:1,habits,completionHistory,goals,notes,theme};
    const snapshot=JSON.stringify(data);
    if(snapshot===appsScriptSnapshotRef.current)return;

    appsScriptDirtyRef.current=true;
    let cancelled=false;
    setManualSyncStatus("waiting");
    const timer=setTimeout(async()=>{
      try{
        setManualSyncStatus("saving");
        await saveDataToGoogle(data);
        if(cancelled)return;
        appsScriptSnapshotRef.current=snapshot;
        appsScriptDirtyRef.current=false;
        setManualSyncStatus("synced");
      }catch(error){
        if(cancelled)return;
        console.error("Không thể tự động lưu qua Apps Script:",error);
        setManualSyncStatus("error");
      }
    },1500);

    return()=>{
      cancelled=true;
      clearTimeout(timer);
    };
  },[habits,completionHistory,goals,notes,theme,hydrated,appsScriptReady]);
  useEffect(() => {
    if(!hydrated||!appsScriptReady)return;

    let cancelled=false;
    const pullLatest=async()=>{
      if(appsScriptDirtyRef.current||document.visibilityState==="hidden")return;
      try{
        const data=await loadDataFromGoogle();
        if(cancelled||!data)return;
        const snapshot=JSON.stringify(data);
        if(snapshot===appsScriptSnapshotRef.current)return;

        appsScriptSnapshotRef.current=snapshot;
        if(Array.isArray(data.habits))setHabits(resetHabitRates(data.habits));
        if(data.completionHistory&&typeof data.completionHistory==="object"&&!Array.isArray(data.completionHistory))setCompletionHistory(data.completionHistory);
        if(Array.isArray(data.goals))setGoals(data.goals);
        if(Array.isArray(data.notes))setNotes(data.notes);
        if(data.theme==="light"||data.theme==="dark")setTheme(data.theme);
        setManualSyncStatus("synced");
      }catch(error){
        if(cancelled)return;
        console.error("Không thể tải bản cập nhật từ Apps Script:",error);
        setManualSyncStatus("error");
      }
    };

    const interval=setInterval(pullLatest,5000);
    const refresh=()=>pullLatest();
    window.addEventListener("focus",refresh);
    document.addEventListener("visibilitychange",refresh);
    return()=>{
      cancelled=true;
      clearInterval(interval);
      window.removeEventListener("focus",refresh);
      document.removeEventListener("visibilitychange",refresh);
    };
  },[hydrated,appsScriptReady]);
  useEffect(() => { window.scrollTo({top:0,behavior:"smooth"}); }, [view]);
  useEffect(() => {
    if(!toast)return;
    const timer=setTimeout(()=>setToast(""),2200);
    return()=>clearTimeout(timer);
  },[toast]);

  const notify=message=>setToast(message);
  const backupToAppsScript=async()=>{
    setManualSyncStatus("saving");
    try{
      const data={version:1,habits,completionHistory,goals,notes,theme};
      await saveDataToGoogle(data);
      appsScriptSnapshotRef.current=JSON.stringify(data);
      appsScriptDirtyRef.current=false;
      setManualSyncStatus("synced");
      notify("Đã sao lưu qua Google Apps Script");
    }catch(error){
      console.error("Không thể sao lưu qua Apps Script:",error);
      setManualSyncStatus("error");
      notify(error.message||"Sao lưu Apps Script thất bại");
    }
  };
  const restoreFromAppsScript=async()=>{
    setManualSyncStatus("loading");
    try{
      const data=await loadDataFromGoogle();
      if(!data){
        setManualSyncStatus("synced");
        notify("Apps Script chưa có bản sao lưu");
        return;
      }
      appsScriptSnapshotRef.current=JSON.stringify(data);
      appsScriptDirtyRef.current=false;
      if(Array.isArray(data.habits))setHabits(resetHabitRates(data.habits));
      if(data.completionHistory&&typeof data.completionHistory==="object"&&!Array.isArray(data.completionHistory))setCompletionHistory(data.completionHistory);
      if(Array.isArray(data.goals))setGoals(data.goals);
      if(Array.isArray(data.notes))setNotes(data.notes);
      if(data.theme==="light"||data.theme==="dark")setTheme(data.theme);
      setAppsScriptReady(true);
      setManualSyncStatus("synced");
      notify("Đã khôi phục dữ liệu từ Apps Script");
    }catch(error){
      console.error("Không thể khôi phục qua Apps Script:",error);
      setManualSyncStatus("error");
      notify(error.message||"Khôi phục Apps Script thất bại");
    }
  };
  const recordCompletion=(id,done)=>{
    setCompletionHistory(history=>{
      const ids=new Set(history[dateKey()]||[]);
      if(done)ids.add(id);else ids.delete(id);
      return {...history,[dateKey()]:[...ids]};
    });
  };
  const toggle = id => {
    const habit=habits.find(h=>h.id===id);
    if(!habit)return;
    const done=!habit.done;
    setHabits(habits.map(h => h.id === id ? {...h,done,progress:done?100:0,detail:done?"Đã hoàn thành":"Chưa thực hiện"} : h));
    recordCompletion(id,done);
    notify("Đã cập nhật tiến độ");
  };
  const updateHabitProgress=(id,value)=>{
    const progress=Math.min(100,Math.max(0,Number(value)||0));
    const done=progress===100;
    setHabits(habits.map(h=>h.id===id?{...h,progress,done,detail:done?"Đã hoàn thành":progress?`${progress}% mục tiêu`:"Chưa thực hiện"}:h));
    recordCompletion(id,done);
    setProgressHabit(null);
    notify(`Đã cập nhật tiến độ thành ${progress}%`);
  };
  const navigate = label => { setView(label); setMobile(false); };
  const saveHabit = form => {
    const categoryMap = {"Sức khỏe":["water","blue"],"Học tập":["book","orange"],"Phát triển bản thân":["brain","purple"],"Công việc":["language","yellow"],"Khác":["journal","slate"]};
    const [icon,color] = categoryMap[form.category] || ["journal","slate"];
    const rawPeriod=form.time.replace("Buổi ","");
    const period=rawPeriod.charAt(0).toUpperCase()+rawPeriod.slice(1);
    if(editingHabit){
      setHabits(habits.map(h=>h.id===editingHabit.id?{...h,...form,name:form.name.trim(),icon,color,period,category:form.category}:h));
      notify("Đã cập nhật thói quen");
    } else {
      setHabits([...habits,{id:Date.now(),...form,name:form.name.trim(),detail:"Chưa thực hiện",icon,color,progress:0,done:false,period,rate:0,category:form.category}]);
      notify("Đã thêm thói quen mới");
    }
    setEditingHabit(null);
    setView("Thói quen");
  };
  const deleteHabit=id=>{
    setHabits(habits.filter(h=>h.id!==id));
    setCompletionHistory(history=>Object.fromEntries(Object.entries(history).map(([key,ids])=>[key,ids.filter(item=>item!==id)])));
    notify("Đã xóa thói quen");
  };
  const resetData=()=>{
    setHabits(seedHabits);setGoals(goalsSeed);setNotes(notesSeed);
    setCompletionHistory({[dateKey()]:seedHabits.filter(h=>h.done).map(h=>h.id)});
    localStorage.setItem("habitflow-sample-version",SAMPLE_VERSION);
    localStorage.setItem("habitflow-reset-version",RESET_VERSION);
    notify("Đã khôi phục dữ liệu mẫu");
  };
  const selectDate=day=>{setSelectedDay(day);setView("Chi tiết ngày")};
  const saveGoal=data=>{
    if(editingGoal){
      setGoals(goals.map(g=>g.id===editingGoal.id?{...g,...data}:g));
      notify("Đã cập nhật mục tiêu");
    }else{
      setGoals([...goals,{id:Date.now(),...data,icon:"book",color:"purple"}]);
      notify("Đã thêm mục tiêu mới");
    }
    setEditingGoal(null);setGoalModal(false);
  };
  const deleteGoal=id=>{setGoals(goals.filter(g=>g.id!==id));notify("Đã xóa mục tiêu")};

  let content;
  if(view==="Tổng quan"||view==="Hôm nay") content=<Overview habits={habits} completionHistory={completionHistory} toggle={toggle} openProgress={{openModal:setProgressHabit,quickSave:updateHabitProgress}} openAdd={()=>{setEditingHabit(null);setView("Thêm thói quen")}} setView={setView} onSelectDate={selectDate}/>;
  else if(view==="Chi tiết ngày") content=<DayDetailView habits={habits} completionHistory={completionHistory} day={selectedDay} onBack={()=>setView("Tổng quan")}/>;
  else if(view==="Thói quen") content=<HabitsView habits={habits} query={query} openAdd={()=>{setEditingHabit(null);setView("Thêm thói quen")}} onEdit={habit=>{setEditingHabit(habit);setView("Thêm thói quen")}} onProgress={setProgressHabit} onDelete={deleteHabit}/>;
  else if(view==="Thêm thói quen") content=<AddHabitView onBack={()=>{setEditingHabit(null);setView("Thói quen")}} onSave={saveHabit} initialHabit={editingHabit}/>;
  else if(view==="Lịch") content=<CalendarView habits={habits} completionHistory={completionHistory}/>;
  else if(view==="Báo cáo") content=<ReportsView habits={habits}/>;
  else if(view==="Thống kê") content=<StatisticsView habits={habits}/>;
  else if(view==="Mục tiêu") content=<GoalsView goals={goals} openGoal={()=>{setEditingGoal(null);setGoalModal(true)}} onEdit={goal=>{setEditingGoal(goal);setGoalModal(true)}} onDelete={deleteGoal}/>;
  else if(view==="Ghi chú") content=<NotesView notes={notes} setNotes={setNotes} notify={notify}/>;
  else content=<SettingsView resetData={resetData} notify={notify} theme={theme} toggleTheme={()=>{setTheme(theme==="dark"?"light":"dark");notify(theme==="dark"?"Đã chuyển sang giao diện sáng":"Đã chuyển sang giao diện tối")}} manualSync={{status:manualSyncStatus,backup:backupToAppsScript,restore:restoreFromAppsScript}}/>;

  return <div className={`app ${theme}`} data-hydrated={hydrated?"true":"false"}>
    <aside className={mobile ? "sidebar open" : "sidebar"}>
      <button className="brand" onClick={()=>navigate("Tổng quan")}><span><Check /></span>Habit<span>Flow</span></button>
      <nav>{nav.map(([label, Icon]) => <button key={label} className={(view===label||(label==="Thói quen"&&view==="Thêm thói quen")||(label==="Lịch"&&view==="Chi tiết ngày")) ? "active" : ""} onClick={() => navigate(label)}><Icon />{label}</button>)}</nav>
    </aside>
    {mobile && <div className="scrim" onClick={()=>setMobile(false)}/>}
    <main>
      <header>
        <button aria-label="Mở menu" className="menu-btn" onClick={()=>setMobile(true)}><Menu/></button>
        <div className="search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setView("Thói quen")} placeholder="Tìm thói quen..."/>{query&&<button aria-label="Xóa tìm kiếm" onClick={()=>setQuery("")}><X/></button>}</div>
        <button aria-label="Thông báo" className="icon-btn"><Bell/></button>
      </header>
      <div className="view-shell">{content}</div>
    </main>
    {progressHabit&&<ProgressModal habit={progressHabit} close={()=>setProgressHabit(null)} save={value=>updateHabitProgress(progressHabit.id,value)}/>}
    {goalModal&&<GoalModal close={()=>{setGoalModal(false);setEditingGoal(null)}} save={saveGoal} goal={editingGoal}/>}
    {toast&&<div className="toast"><CircleCheckBig/>{toast}</div>}
  </div>;
}
