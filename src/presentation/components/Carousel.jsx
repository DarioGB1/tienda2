import './Carrusel.css';
import './carousel.css';
import React, { useEffect, useRef, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../infraestructure/firebase-connection.js';
import { Link } from 'react-router-dom';

const Carousel = React.memo (() => {
    const listRef = useRef();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const categoriesCollectionRef = collection(db, 'product_categories');
            const categoriesSnapshot = await getDocs(categoriesCollectionRef);
            const categoriesData = [];
            categoriesSnapshot.forEach((doc) => {
                const data = doc.data();
                categoriesData.push({
                    id: doc.id,
                    name: data.name,
                    description: data.description,
                    picture: data.picture
                });
            });
            setCategories(categoriesData);
        };

        fetchCategories();
    }, []);

    const scrollToImage = (direction) => {
        const totalSlides = categories.length;
        let newIndex = currentIndex;

        if (direction === 'next') {
            newIndex = (currentIndex + 1) % totalSlides;
        } else if (direction === 'prev') {
            newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        }

        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        if (categories.length > 0) {
            const container = listRef.current;
            const slides = container.querySelectorAll('.cascade-slider_item');

            slides.forEach(slide => slide.classList.remove('now', 'next', 'prev'));

            slides[currentIndex].classList.add('now');
            slides[(currentIndex + 1) % categories.length].classList.add('next');
            slides[(currentIndex - 1 + categories.length) % categories.length].classList.add('prev');

            const intervalId = setInterval(() => {
                scrollToImage('next');
            }, 10000);

            return () => clearInterval(intervalId);
        }
    }, [currentIndex, categories]);

    return (
        <div className="cascade-slider_container" id="cascade-slider">
            <div className="cascade-slider_slides" ref={listRef}>
                {
                    categories.map((item) => (
                        <Link key={item.id} to={`/Category`}>
                            <div className="cascade-slider_item">
                                <img className='imgs' src={item.picture} alt={`category ${item.name}`} />
                                <div className="category-info">
                                    <h3>{item.name}</h3>
                                    <p className='DescripcionC'>{item.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                }
            </div>

            <ol className="cascade-slider_nav">
                {
                    categories.map((_, index) => (
                        <li key={`dot-${index}`} className={`cascade-slider_dot ${index === currentIndex ? 'cur' : ''}`} />
                    ))
                }
            </ol>

            <span className="cascade-slider_arrow cascade-slider_arrow-left" data-action="next" onClick={() => scrollToImage('next')}>&#10092;</span>
            <span className="cascade-slider_arrow cascade-slider_arrow-right" data-action="prev" onClick={() => scrollToImage('prev')}>&#10093;</span>
        </div>
    );
}
)
export default Carousel;
