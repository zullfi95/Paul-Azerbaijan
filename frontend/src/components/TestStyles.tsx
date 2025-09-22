export default function TestStyles() {
  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#3B82F6',
      color: 'white'
    }}>
      <h1 style={{
        fontSize: '2.25rem',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>
        Тест стилей
      </h1>
      <p style={{ fontSize: '1.125rem' }}>
        Если вы видите этот текст с синим фоном, то базовые стили работают!
      </p>
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: 'white',
        color: 'black',
        borderRadius: '0.25rem'
      }}>
        <p>Белый блок с черным текстом</p>
      </div>
    </div>
  );
}
