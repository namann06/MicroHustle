import * as React from "react"

export function Calendar({ mode = "single", selected, captionLayout = "dropdown", month, onMonthChange, onSelect }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(month || today);

  React.useEffect(() => {
    if (month) setCurrentMonth(month);
  }, [month]);

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDay = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handleSelect = (day) => {
    if (onSelect) {
      const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      onSelect(selectedDate);
    }
  };

  const handleMonthChange = (e) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(Number(e.target.value));
    setCurrentMonth(newMonth);
    if (onMonthChange) onMonthChange(newMonth);
  };

  const handleYearChange = (e) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(Number(e.target.value));
    setCurrentMonth(newMonth);
    if (onMonthChange) onMonthChange(newMonth);
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDay(currentMonth); i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }
    for (let day = 1; day <= daysInMonth(currentMonth); day++) {
      const isSelected = selected && selected.getDate() === day && selected.getMonth() === currentMonth.getMonth() && selected.getFullYear() === currentMonth.getFullYear();
      days.push(
        <button
          key={day}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`}
          onClick={() => handleSelect(day)}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-2">
        <select value={currentMonth.getMonth()} onChange={handleMonthChange} className="mr-2">
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <select value={currentMonth.getFullYear()} onChange={handleYearChange}>
          {Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-center">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}
