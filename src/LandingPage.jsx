import React, { useEffect, useRef, useState } from 'react';
import './LandingPage.css';
import smile from './assets/smile.png';
import logo from './assets/logo.png';
import plane from './assets/plane.png';
import ship from './assets/ship.png';
import car from './assets/car.png';
import bus from './assets/bus.png';

const LandingPage = ({ onNavigate }) => {
    const ball1Ref = useRef(null);
    const ball2Ref = useRef(null);
    const faceRef = useRef(null);
    const cloudContainerRef = useRef(null);
    const cardsRef = useRef(null);
    const faceMoveScale = 0.2;
    const [isIdle, setIsIdle] = useState(false);
    const idleActionRef = useRef(null);
    const [isBlinking, setIsBlinking] = useState(false);
    const blinkIntervalRef = useRef(null);

    const currentIndexRef = useRef(-1);
    const isScrollingRef = useRef(false);

    // ====================================================================
    // START CHANGE 1: Create a separate ref for each of the 4 sections.
    // ====================================================================
    const section1Ref = useRef(null);
    const section2Ref = useRef(null);
    const section3Ref = useRef(null);
    const section4Ref = useRef(null);

    // For easier access, we'll put them in an array.
    const sectionRefs = [section1Ref, section2Ref, section3Ref, section4Ref];
    // ====================================================================
    // END CHANGE 1
    // ====================================================================


    useEffect(() => {
        const setCardsMargin = () => {
            if (cloudContainerRef.current && cardsRef.current) {
                const cloudContainerHeight = cloudContainerRef.current.offsetHeight + window.innerHeight / 25;
                cardsRef.current.style.marginTop = `${cloudContainerHeight}px`;
            }
        };

        setCardsMargin();
        window.addEventListener('resize', setCardsMargin);

        return () => {
            window.removeEventListener('resize', setCardsMargin);
        };
    }, []);


    useEffect(() => {
        const blinkAction = () => {
            setIsBlinking(true);
            setTimeout(() => {
                setIsBlinking(false);
            }, 700);
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
            faceContainer.style.transform = `translate(${xOffset * faceMoveScale}%, ${yOffset * faceMoveScale}%)`;

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
        const handleWheel = (event) => {
            if (isScrollingRef.current) {
                return;
            }

            const cards = cardsRef.current?.querySelectorAll('.card');
            if (!cards || cards.length === 0) {
                return;
            }

            const scrollDirection = event.deltaY > 0 ? 'down' : 'up';
            let nextIndex = currentIndexRef.current;

            if (scrollDirection === 'down') {
                nextIndex = Math.min(currentIndexRef.current + 1, cards.length - 1);
            } else { // 'up'
                nextIndex = Math.max(currentIndexRef.current - 1, -1);
            }

            if (nextIndex !== currentIndexRef.current) {
                event.preventDefault();
                isScrollingRef.current = true;
                currentIndexRef.current = nextIndex;

                // ====================================================================
                // START CHANGE 2: Replace the old animation logic with a generalized loop.
                // ====================================================================
                sectionRefs.forEach((ref, index) => {
                    const sectionEl = ref.current;
                    if (sectionEl) {
                        if (index === nextIndex) {
                            // The card we are scrolling TO: Animate it IN.
                            sectionEl.classList.add('in-view');
                            sectionEl.classList.remove('exit-left');
                        } else if (index < nextIndex) {
                            // Cards we have scrolled PAST: Animate them OUT.
                            sectionEl.classList.add('exit-left');
                            sectionEl.classList.remove('in-view');
                        } else {
                            // Upcoming cards or cards we scroll UP from: RESET them.
                            sectionEl.classList.remove('in-view', 'exit-left');
                        }
                    }
                });
                // ====================================================================
                // END CHANGE 2
                // ====================================================================

                if (nextIndex === -1) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 800);
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, []);


    return (
        <>
            <div className="clouds"></div>
            <div className='body cloud-container' ref={cloudContainerRef}>
                <div className="top">
                    <span>Smiles World</span>
                    <img className='logo' src={logo} alt="" />
                </div>
                <div className="tagline">
                    Explore More. Smile Wider
                </div>
                <main className='earth'>
                    <div className={`face-container ${isBlinking ? 'blinking-face' : ''}`} ref={faceRef}>
                        <div className="eyes">
                            <div className={`eye ${isBlinking ? 'blinking' : ''}`}>
                                <div className="ball" ref={ball1Ref}></div>
                            </div>
                            <div className={`eye ${isBlinking ? 'blinking' : ''}`}>
                                <div className="ball" ref={ball2Ref}></div>
                            </div>
                        </div>
                        <div className="smile">
                            <img src={smile} alt="smile graphic" />
                        </div>
                    </div>
                </main>
            </div>
            <div className="btn">
                <button onClick={onNavigate}>Book Now</button>
            </div>
            <div className="cards" ref={cardsRef}>
                <div className="cloud"></div>
                <div className='cards-con'>

                    {/* ==================================================================== */}
                    {/* START CHANGE 3: Assign each specific ref to its section. */}
                    {/* ==================================================================== */}
                    <div className="card">
                        <section className='animated-section' ref={section1Ref}>
                             <p>We offer all types of tours by air.</p>
                             <div className='vehicle plane' alt="" />
                        </section>
                    </div>

                    <div className="card">
                        <section className='animated-section' ref={section2Ref}>
                             <p>Explore the world by land with our exclusive packages.</p>
                             <div className='vehicle bus' alt="" />
                        </section>
                    </div>

                    <div className="card">
                        <section className='animated-section' ref={section3Ref}>
                             <p>Sail the seas on an unforgettable cruise.</p>
                             <div className='vehicle car' alt="" />
                        </section>
                    </div>

                    <div className="card">
                        <section className='animated-section' ref={section4Ref}>
                             <p>Your adventure is just a booking away.</p>
                             <div className='vehicle ship' alt="" />
                        </section>
                    </div>
                    {/* ==================================================================== */}
                    {/* END CHANGE 3 */}
                    {/* ==================================================================== */}

                </div>
            </div>
        </>
    );
};

export default LandingPage;