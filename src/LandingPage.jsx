import React, { useEffect, useRef, useState } from 'react';
import './LandingPage.css';
import smile from './assets/smile.png';
import logo from './assets/logo.png';
import plane from './assets/plane.png';
import bus from './assets/bus.png';
import ship from './assets/ship.png';
import car from './assets/car.png';

const LandingPage = ({ onNavigate }) => {
    const ball1Ref = useRef(null);
    const ball2Ref = useRef(null);
    const faceRef = useRef(null);
    const [isIdle, setIsIdle] = useState(false);
    const idleActionRef = useRef(null);
    const [isBlinking, setIsBlinking] = useState(false);
    const blinkIntervalRef = useRef(null);

    const slidesContainerRef = useRef(null);
    const currentIndexRef = useRef(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const isScrollingRef = useRef(false);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const totalSlides = 5;

    useEffect(() => {
        const blinkAction = () => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 700);
        };
        const initialTimeout = setTimeout(() => {
            blinkAction();
            blinkIntervalRef.current = setInterval(blinkAction, 3700);
        }, 3000);
        return () => {
            clearTimeout(initialTimeout);
            clearInterval(blinkIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        const balls = [ball1Ref.current, ball2Ref.current];
        const faceContainer = faceRef.current;
        if (!balls[0] || !balls[1] || !faceContainer) return;

        const scheduleRandomMove = () => {
            const maxOffsetPercent = 25;
            const angle = Math.random() * 2 * Math.PI;
            const radius = maxOffsetPercent * Math.sqrt(Math.random());
            const xOffset = radius * Math.cos(angle);
            const yOffset = radius * Math.sin(angle);
            const finalX = 50 + xOffset;
            const finalY = 50 + yOffset;
            const randomDuration = (0.7 + Math.random() * 0.8).toFixed(2);

            balls.forEach((ball) => {
                if (ball) {
                    ball.style.transitionDuration = `${randomDuration}s`;
                    ball.style.left = `${finalX}%`;
                    ball.style.top = `${finalY}%`;
                }
            });

            faceContainer.style.transitionDuration = `${randomDuration}s`;
            faceContainer.style.transform = `translate(${xOffset * 0.2}%, ${yOffset * 0.2}%)`;

            const randomDelay = 1000 + Math.random() * 1500;
            idleActionRef.current = setTimeout(scheduleRandomMove, randomDelay);
        };

        if (isIdle) {
            balls.forEach((ball) => ball?.classList.add('idle-transition'));
            faceContainer.classList.add('idle-transition');
            scheduleRandomMove();
        } else {
            balls.forEach((ball) => ball?.classList.remove('idle-transition'));
            faceContainer.classList.remove('idle-transition');
        }

        return () => clearTimeout(idleActionRef.current);
    }, [isIdle]);

    useEffect(() => {
        const balls = [ball1Ref.current, ball2Ref.current];
        const faceContainer = faceRef.current;
        const faceMoveScale = 0.2;

        const handleMouseMove = (event) => {
            clearTimeout(idleActionRef.current);
            setIsIdle(false);

            const xRatio = event.clientX / window.innerWidth - 0.5;
            const yRatio = event.clientY / window.innerHeight - 0.5;
            const maxOffset = 1.2;
            const xOffset = Math.max(-maxOffset, Math.min(maxOffset, xRatio * 5));
            const yOffset = Math.max(-maxOffset, Math.min(maxOffset, yRatio * 5));

            balls.forEach((ball) => {
                if (ball) {
                    ball.style.transitionDuration = '0s';
                    ball.style.left = `calc(50% + ${xOffset}vw)`;
                    ball.style.top = `calc(50% + ${yOffset}vw)`;
                    ball.style.transform = 'translate(-50%, -50%)';
                }
            });

            if (faceContainer) {
                faceContainer.style.transitionDuration = '0s';
                faceContainer.style.transform = `translate(${xOffset * faceMoveScale}vw, ${yOffset * faceMoveScale}vw)`;
            }

            idleActionRef.current = setTimeout(() => setIsIdle(true), 2000);
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(idleActionRef.current);
        };
    }, []);

    useEffect(() => {
        const changeSlide = (direction) => {
            if (isScrollingRef.current) return;
            const newIndex = currentIndexRef.current + direction;

            if (newIndex >= 0 && newIndex < totalSlides) {
                isScrollingRef.current = true;
                
                setActiveIndex(-1);
                currentIndexRef.current = newIndex;

                if (slidesContainerRef.current) {
                    slidesContainerRef.current.style.transform = `translateX(-${newIndex * 100}vw)`;
                }
                
                setTimeout(() => {
                    setActiveIndex(newIndex);
                }, 800);

                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 800);
            }
        };

        const handleWheel = (event) => {
            event.preventDefault();
            if (isScrollingRef.current) return;
            const scrollValue = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
            changeSlide(scrollValue > 0 ? 1 : -1);
        };
        
        const handleTouchStart = (event) => {
            touchStartX.current = event.touches[0].clientX;
            touchStartY.current = event.touches[0].clientY;
        };

        const handleTouchMove = (event) => {
            if (!touchStartX.current || !touchStartY.current) return;
            const touchCurrentX = event.touches[0].clientX;
            const touchCurrentY = event.touches[0].clientY;
            const swipeDistanceX = Math.abs(touchStartX.current - touchCurrentX);
            const swipeDistanceY = Math.abs(touchStartY.current - touchCurrentY);
            if (swipeDistanceY > swipeDistanceX) event.preventDefault();
        };

        const handleTouchEnd = (event) => {
            if (isScrollingRef.current) return;
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            const swipeDistanceX = touchStartX.current - touchEndX;
            const swipeDistanceY = touchStartY.current - touchEndY;

            if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
                if (Math.abs(swipeDistanceX) > 50) changeSlide(swipeDistanceX > 0 ? 1 : -1);
            } else {
                if (Math.abs(swipeDistanceY) > 50) changeSlide(swipeDistanceY > 0 ? 1 : -1);
            }
            touchStartX.current = 0;
            touchStartY.current = 0;
        };
        
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return (
        <div className="landing-page-wrapper">
            <div className="clouds"></div>
            <div className="slides-container" ref={slidesContainerRef}>
                <div className="slide hero-slide">
                    <div className="top">
                        <span>Smiles World</span>
                        <img className='logo' src={logo} alt="Smiles World Logo" />
                    </div>
                    <div className="tagline">
                        Explore More. Smile Wider
                    </div>
                    <main className='earth'>
                        <div className={`face-container ${isBlinking ? 'blinking-face' : ''}`} ref={faceRef}>
                            <div className="eyes">
                                <div className={`eye ${isBlinking ? 'blinking' : ''}`}><div className="ball" ref={ball1Ref}></div></div>
                                <div className={`eye ${isBlinking ? 'blinking' : ''}`}><div className="ball" ref={ball2Ref}></div></div>
                            </div>
                            <div className="smile"><img src={smile} alt="smile graphic" /></div>
                        </div>
                    </main>
                </div>

                <div className="slide info-slide">
                    <section className='info-section'>
                        <div className='vehicle'>
                            <img src={plane} alt="Airplane Tour" />
                        </div>
                        <div className={`info-panel ${activeIndex === 1 ? 'visible' : ''}`}>
                            <div className="stable-text-wrapper">
                                <h2>Air Tours</h2>
                                <p>Discover the world from a breathtaking perspective with our exclusive air tours.</p>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="slide info-slide">
                    <section className='info-section'>
                        <div className='vehicle'>
                            <img src={bus} alt="Bus Tour" />
                        </div>
                         <div className={`info-panel ground-bg ${activeIndex === 2 ? 'visible' : ''}`}>
                            <div className="stable-text-wrapper">
                                <h2>Land Adventures</h2>
                                <p>Journey through stunning landscapes and vibrant cultures on the ground.</p>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="slide info-slide">
                    <section className='info-section'>
                        <div className='vehicle'>
                            <img src={car} alt="Road Trip" />
                        </div>
                        <div className={`info-panel ground-bg ${activeIndex === 3 ? 'visible' : ''}`}>
                            <div className="stable-text-wrapper">
                                <h2>Start Your Journey</h2>
                                <p>Your next great adventure is just a click away. Let's get you on the road.</p>
                            </div>
                        </div>
                    </section>
                </div>
                {/* START CHANGE: Added tilting-wrapper div */}
                <div className="slide info-slide">
                    <section className='info-section'>
                        <div className='vehicle tilting-vehicle'>
                            <img src={ship} alt="Cruise Ship Tour" />
                        </div>
                         <div className={`info-panel water-bg tilting-panel ${activeIndex === 4 ? 'visible' : ''}`}>
                            <div className="tilting-wrapper">
                                <div className="stable-text-wrapper">
                                    <h2>Ocean Voyages</h2>
                                    <p>Set sail on the open seas for an unforgettable maritime experience.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                {/* END CHANGE */}
            </div>
            <div className="btn">
                <button onClick={onNavigate}>Book Now</button>
            </div>
        </div>
    );
};

export default LandingPage;