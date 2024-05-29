import './Carrusel.css';
import './carousel.css';  // Importa tu archivo CSS para estilos
import React, { useEffect, useRef, useState } from 'react';
import { data } from "../assets/data.js";
import { useHref } from 'react-router-dom';

function Carousel() {
    const listRef = useRef();
    const [currentIndex, setCurrentIndex] = useState(0);

    const scrollToImage = (direction) => {
        const totalSlides = data.length;
        let newIndex = currentIndex;

        if (direction === 'next') {
            newIndex = (currentIndex + 1) % totalSlides;
        } else if (direction === 'prev') {
            newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        }

        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        const container = listRef.current;
        const slides = container.querySelectorAll('.cascade-slider_item');

        slides.forEach(slide => slide.classList.remove('now', 'next', 'prev'));

        slides[currentIndex].classList.add('now');
        slides[(currentIndex + 1) % data.length].classList.add('next');
        slides[(currentIndex - 1 + data.length) % data.length].classList.add('prev');

        const intervalId = setInterval(() => {
            scrollToImage('next');
        }, 10000);

        return () => clearInterval(intervalId);
    }, [currentIndex]);

    return (
        <div className="cascade-slider_container" id="cascade-slider">
            <div className="cascade-slider_slides" ref={listRef}>
                {
                    data.map((item, index) => (
                        <a href={item.link} key={index}>
                            <div className="cascade-slider_item">
                                <img className='imgs' src={item.imgUrl} alt={`tienda ${item.id}`} />
                            </div>
                        </a>
                    ))
                }
            </div>

            <ol className="cascade-slider_nav">
                {
                    data.map((_, index) => (
                        <li key={`dot-${index}`} className={`cascade-slider_dot ${index === currentIndex ? 'cur' : ''}`} />
                    ))
                }
            </ol>

            <span className="cascade-slider_arrow cascade-slider_arrow-left" data-action="prev" onClick={() => scrollToImage('prev')}>&#10092;</span>
            <span className="cascade-slider_arrow cascade-slider_arrow-right" data-action="next" onClick={() => scrollToImage('next')}>&#10093;</span>
        </div>
    );
}

export default Carousel;