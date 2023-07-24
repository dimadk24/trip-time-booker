export function Footer() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
      }}
    >
      <footer className="bg-white rounded-lg shadow m-3">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-3">
          <span className="block text-sm text-gray-500 sm:text-center">
            <a
              target="_blank"
              href="https://icons8.com/icon/bDrb5MdYaEje/delivery-time"
              className="underline"
            >
              Delivery Time
            </a>{' '}
            icon by{' '}
            <a target="_blank" href="https://icons8.com" className="underline">
              Icons8
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
