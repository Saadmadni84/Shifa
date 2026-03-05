import VitalCard from './VitalCard'

export default function VitalsGrid({ vitals }) {
  if (!vitals)
    return (
      <div className="px-4 py-8 text-center text-gray-400 text-sm">
        <span className="text-3xl block mb-2">❤️</span>
        Vitals not recorded.
      </div>
    )
  const cards = [
    {
      show: vitals.bloodPressureSystolic != null,
      emoji: '🩺',
      label: 'Blood Pressure',
      value: vitals.bloodPressureSystolic != null ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}` : null,
      unit: 'mmHg',
      normalLow: 90,
      normalHigh: 130,
    },
    { show: vitals.heartRate != null, emoji: '💓', label: 'Heart Rate', value: vitals.heartRate, unit: 'bpm', normalLow: 60, normalHigh: 100 },
    { show: vitals.temperatureCelsius != null, emoji: '🌡️', label: 'Temperature', value: vitals.temperatureCelsius, unit: '°C', normalLow: 36.1, normalHigh: 37.2 },
    { show: vitals.spo2Percentage != null, emoji: '💨', label: 'SpO₂', value: vitals.spo2Percentage, unit: '%', normalLow: 95, normalHigh: 100 },
    { show: vitals.weightKg != null, emoji: '⚖️', label: 'Weight', value: vitals.weightKg, unit: 'kg', normalLow: null, normalHigh: null },
    { show: vitals.bloodSugarFasting != null, emoji: '🩸', label: 'Blood Sugar (F)', value: vitals.bloodSugarFasting, unit: 'mg/dL', normalLow: 70, normalHigh: 100 },
    { show: vitals.bloodSugarHba1c != null, emoji: '📊', label: 'HbA1c', value: vitals.bloodSugarHba1c, unit: '%', normalLow: 4, normalHigh: 5.7 },
    { show: vitals.bmi != null, emoji: '📏', label: 'BMI', value: vitals.bmi, unit: '', normalLow: 18.5, normalHigh: 24.9 },
  ].filter((c) => c.show)
  if (!cards.length) return <div className="px-4 py-8 text-center text-gray-400 text-sm">No vitals recorded.</div>
  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c, i) => (
          <VitalCard key={i} {...c} />
        ))}
      </div>
    </div>
  )
}
