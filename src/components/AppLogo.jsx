import logo from '../assets/path360-logo.png'

export default function AppLogo({
  width = 150,
  align = 'left',
  style = {},
  imageStyle = {},
}) {
  const justifyContent =
    align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent,
        ...style,
      }}
    >
      <img
        src={logo}
        alt="PATH360 logo"
        style={{
          display: 'block',
          width,
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'contain',
          ...imageStyle,
        }}
      />
    </div>
  )
}