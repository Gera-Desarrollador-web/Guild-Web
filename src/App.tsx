import './index.css'
import GuildTable from './assets/GuildTable'

function App() {


  return (
    <>
      <div className='flex flex-col items-center  min-h-screen bg-gray-50'>
        <div className="flex justify-center items-center  w-2xl ">
          <img
            src="/Twenty.png"
            alt="guild text"
          />
        </div>
    <GuildTable />
      </div>
    </>
  )
}

export default App
