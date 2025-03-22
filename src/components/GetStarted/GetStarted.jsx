import React from 'react'
import './GetStarted.css'
import { Link } from 'react-router-dom'
const GetStarted = () => {
  return (
    <section className="g-wrapper">
        <div className="paddings innerWidth flexColStart g-blue">
            <span className='g-title'>Get started with BookHive</span>
            <span className='g-desc'>Subscribe and find super attractive books from us.</span>
            <span className='g-desc'>Find your books now.</span>
            <Link to='/books'><button className='g-btn'>Get Started</button></Link>
        </div>
    </section>
  )
}

export default GetStarted