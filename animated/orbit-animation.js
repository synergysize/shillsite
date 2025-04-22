document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    const orbitMap = document.getElementById('orbit-map');
    const tooltip = document.getElementById('tooltip');
    const shillAllBtn = document.getElementById('shill-all-btn');
    const copyNotification = document.getElementById('copy-notification');
    const rippleContainer = document.getElementById('ripple-container');
    
    // Animation and state variables
    let platforms = [];
    let satellites = [];
    let animationFrameId = null;
    
    // Default message for platforms without prefill links
    const defaultMessage = "Check out this amazing token! Visit https://token.example.com to learn more! #crypto #token";

    // Load platforms data from JSON
    fetch('../platforms.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Platforms data loaded:', data);
            platforms = data.platforms;
            setupOrbitMap();
            startAnimation();
        })
        .catch(error => {
            console.error('Error loading platforms:', error);
            const errorMsg = document.createElement('div');
            errorMsg.textContent = `Error loading platforms: ${error.message}`;
            errorMsg.style.color = 'red';
            errorMsg.style.padding = '20px';
            orbitMap.appendChild(errorMsg);
        });

    function setupOrbitMap() {
        // Clear any existing elements
        orbitMap.innerHTML = '';
        
        // Create orbit paths first (to be under the satellites)
        createOrbitPaths();
        
        // Create satellite elements
        platforms.forEach((platform, index) => {
            createSatellite(platform, index);
        });
    }
    
    function createOrbitPaths() {
        const containerSize = Math.min(orbitMap.clientWidth, orbitMap.clientHeight);
        const numPlatforms = platforms.length;
        const platformsPerRing = 5; // Adjust this for better visual distribution
        const numRings = Math.ceil(numPlatforms / platformsPerRing);
        
        // Create orbital paths
        for (let i = 1; i <= numRings; i++) {
            const pathRadius = (containerSize * 0.85 * i) / (numRings * 2);
            const orbitalPath = document.createElement('div');
            orbitalPath.className = 'orbit-path';
            orbitalPath.style.width = `${pathRadius * 2}px`;
            orbitalPath.style.height = `${pathRadius * 2}px`;
            orbitMap.appendChild(orbitalPath);
        }
    }
    
    function createSatellite(platform, index) {
        const containerSize = Math.min(orbitMap.clientWidth, orbitMap.clientHeight);
        const platformsPerRing = 5; // Keep consistent with createOrbitPaths
        const ringIndex = Math.floor(index / platformsPerRing);
        const positionInRing = index % platformsPerRing;
        
        // Calculate the orbit radius based on ring index
        const pathRadius = (containerSize * 0.85 * (ringIndex + 1)) / (Math.ceil(platforms.length / platformsPerRing) * 2);
        
        // Calculate starting position and speed (slightly different for each satellite)
        const startAngle = (2 * Math.PI * positionInRing) / Math.min(platformsPerRing, platforms.length - ringIndex * platformsPerRing);
        // Different speeds create more dynamic movement
        const speed = 0.0003 + (ringIndex * 0.00005) + (Math.random() * 0.00015);
        
        // Create the satellite element
        const satellite = document.createElement('div');
        satellite.className = 'platform-satellite';
        
        // Use actual platform logos
        const logoPath = `../social_logos/round_fixed/${platform.name.toLowerCase()}_logo.png`;
        satellite.style.backgroundImage = `url('${logoPath}')`;
        
        // Add friction level class for appropriate glow
        satellite.classList.add(`${platform.friction_level}-friction`);
        
        // Store satellite data for animation
        const satelliteData = {
            element: satellite,
            radius: pathRadius,
            angle: startAngle,
            speed: speed,
            centerX: orbitMap.clientWidth / 2,
            centerY: orbitMap.clientHeight / 2,
            platform: platform
        };
        
        satellites.push(satelliteData);
        
        // Add event listeners for interaction
        setupSatelliteInteraction(satellite, platform);
        
        // Append to orbit map
        orbitMap.appendChild(satellite);
        
        // Initial position update
        updateSatellitePosition(satelliteData);
    }
    
    function setupSatelliteInteraction(satellite, platform) {
        // Tooltip behavior
        satellite.addEventListener('mouseenter', (e) => {
            const action = platform.prefill_link ? 'Click to share' : 'Click to copy message';
            tooltip.textContent = `${platform.name} - ${action}`;
            tooltip.classList.add('visible');
            
            // Add subtle pulse effect on hover
            satellite.classList.add('pulse-animation');
            
            // Position the tooltip near the satellite but not covering it
            updateTooltipPosition(e);
        });
        
        satellite.addEventListener('mousemove', updateTooltipPosition);
        
        satellite.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
            satellite.classList.remove('pulse-animation');
        });
        
        // Click behavior
        satellite.addEventListener('click', () => {
            if (platform.prefill === true && platform.prefill_link) {
                window.open(platform.prefill_link, '_blank');
            } else {
                copyToClipboard(defaultMessage);
                showCopyNotification();
            }
        });
    }
    
    function updateTooltipPosition(e) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const containerRect = orbitMap.getBoundingClientRect();
        
        // Calculate position relative to orbit container
        let x = e.clientX - containerRect.left + 15;
        let y = e.clientY - containerRect.top - tooltipRect.height - 10;
        
        // Make sure tooltip stays within the container
        if (x + tooltipRect.width > containerRect.width) {
            x = e.clientX - containerRect.left - tooltipRect.width - 15;
        }
        
        if (y < 0) {
            y = e.clientY - containerRect.top + 25;
        }
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }
    
    function updateSatellitePosition(satellite) {
        const x = satellite.centerX + Math.cos(satellite.angle) * satellite.radius - 30;
        const y = satellite.centerY + Math.sin(satellite.angle) * satellite.radius - 30;
        
        satellite.element.style.left = `${x}px`;
        satellite.element.style.top = `${y}px`;
        
        // Apply a subtle rotation to the transform for more dynamic movement
        const rotationFactor = Math.sin(satellite.angle * 2) * 5;
        satellite.element.style.transform = `rotate(${rotationFactor}deg)`;
    }
    
    function animateSatellites() {
        // Update each satellite position based on its angle and speed
        satellites.forEach(satellite => {
            satellite.angle += satellite.speed;
            updateSatellitePosition(satellite);
        });
        
        // Continue animation loop
        animationFrameId = requestAnimationFrame(animateSatellites);
    }
    
    function startAnimation() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(animateSatellites);
    }
    
    // Shill All button functionality
    shillAllBtn.addEventListener('click', () => {
        // Create ripple effect from center
        createRippleEffect();
        
        // Filter platforms that have prefill=true and prefill_link
        const prefillPlatforms = platforms.filter(p => p.prefill === true && p.prefill_link);
        
        // Stagger opening tabs by 300ms each to prevent browser blocking
        prefillPlatforms.forEach((platform, index) => {
            setTimeout(() => {
                // Find and highlight the corresponding satellite
                const satelliteData = satellites.find(s => s.platform.name === platform.name);
                if (satelliteData) {
                    highlightSatellite(satelliteData.element);
                }
                
                // Open the link in a new tab
                window.open(platform.prefill_link, '_blank');
            }, index * 300);
        });
        
        // For platforms with prefill=false, copy message to clipboard
        const nonPrefillPlatforms = platforms.filter(p => p.prefill === false);
        if (nonPrefillPlatforms.length > 0) {
            setTimeout(() => {
                copyToClipboard(defaultMessage);
                showCopyNotification();
            }, prefillPlatforms.length * 300);
        }
    });
    
    function createRippleEffect() {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        
        // Position at center of container
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        
        orbitMap.appendChild(ripple);
        
        // Remove after animation completes
        setTimeout(() => {
            orbitMap.removeChild(ripple);
        }, 1500);
    }
    
    function highlightSatellite(element) {
        element.classList.add('platform-highlight');
        
        // Remove highlight class after animation completes
        setTimeout(() => {
            element.classList.remove('platform-highlight');
        }, 800);
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            // Fallback method if clipboard API fails
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    }
    
    function showCopyNotification() {
        copyNotification.style.opacity = '1';
        copyNotification.style.transform = 'translate(-50%, -10px)';
        
        setTimeout(() => {
            copyNotification.style.opacity = '0';
            copyNotification.style.transform = 'translate(-50%, 0)';
        }, 2000);
    }
    
    // Handle window resize to maintain proper layout
    window.addEventListener('resize', () => {
        // Recalculate center positions for all satellites
        satellites.forEach(satellite => {
            satellite.centerX = orbitMap.clientWidth / 2;
            satellite.centerY = orbitMap.clientHeight / 2;
        });
    });
});