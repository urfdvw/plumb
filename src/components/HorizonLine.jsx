export default function HorizonLine({ roll }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        left: '10%', right: '10%',
        top: '50%',
        height: 1,
        background: 'rgba(74,222,128,0.6)',
        transform: `rotate(${-roll}deg)`,
        transformOrigin: 'center',
        transition: 'transform 0.05s linear'
      }} />
      {/* center dot */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 6, height: 6, borderRadius: '50%',
        background: 'rgba(74,222,128,0.8)',
        transform: 'translate(-50%,-50%)'
      }} />
    </div>
  )
}
