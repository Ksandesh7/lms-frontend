import React from 'react'
import './Residencies.css'
import { sliderSettings } from '../../utils/common'
import {Swiper,SwiperSlide,useSwiper} from 'swiper/react'
import "swiper/css"

import data from '../../utils/slider.json'

const Residencies=()=>{
    return(
        <section className="r-wrapper">
            <div className="innerWidth paddings r-container">
                <div className="flexColStart r-head">
                    <span className='orangeText'>Best Choices</span>
                    <span className='primaryText'>Popular Recommendations</span>
                </div>

                <Swiper {...sliderSettings}>
                    <SliderButtons />
                    {
                        data.map((card,i) =>(
                            <SwiperSlide key ={i}>
                                <div className='flexColStart r-card'>
                                    <img src={card.image}></img>

                                    {/* <span className="secondaryText r-price">
                                        <span style={{color:'orange'}}>₹</span>
                                        <span style={{fontWeight:'bold'}}>{card.price}</span>
                                    </span> */}

                                    <span className='primaryText'>{card.name}</span>
                                    <span className='secondaryText' style={{width:'15rem'}}>{card.detail.length>80 ? `${card.detail.slice(0, 80)}...`: card.detail}</span>

                                </div>
                            </SwiperSlide>
                        ))
                    }
                </Swiper>



            </div>
        </section>
    )
}
export default Residencies ;

const SliderButtons=()=>{
    const swiper =useSwiper();

    return(
        <div className="flexCenter r-button">
            <button onClick={()=> swiper.slidePrev()}>&lt;</button>
            <button onClick={()=> swiper.slideNext()}>&gt;</button>
        </div>
    )
}