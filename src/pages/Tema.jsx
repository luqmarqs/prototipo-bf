import { Navigate, useParams } from 'react-router-dom'

function Tema() {
  const { slug } = useParams()

  return <Navigate to={`/campanha/${slug}`} replace />
}

export default Tema
