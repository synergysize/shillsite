
document.addEventListener('DOMContentLoaded', async () => {
    const orbitMap = document.getElementById('orbit-map');

    const centerOrb = document.createElement('div');
    centerOrb.classList.add('center-orb');
    centerOrb.onclick = () => {
        fetch('platforms.json')
            .then(res => res.json())
            .then(platforms => {
                platforms.filter(p => p.prefill).forEach(p => window.open(p.link, '_blank'));
            });
    };
    orbitMap.appendChild(centerOrb);

    const response = await fetch('platforms.json');
    const platforms = await response.json();

    const rings = {
        red: { radius: 130, speed: 50, items: [] },
        yellow: { radius: 230, speed: 40, items: [] },
        green: { radius: 340, speed: 30, items: [] },
    };

    platforms.forEach(p => {
        const icon = document.createElement('img');
        icon.src = p.logo;
        icon.classList.add('orbit-icon');

        const wrapper = document.createElement('div');
        wrapper.classList.add('orbit-wrapper');

        if (p.friction === 'low') wrapper.classList.add('halo-green');
        else if (p.friction === 'medium') wrapper.classList.add('halo-yellow');
        else wrapper.classList.add('halo-red');

        wrapper.appendChild(icon);
        wrapper.onclick = () => {
            if (p.prefill) window.open(p.link, '_blank');
            else navigator.clipboard.writeText("Hey, check this out! " + p.link);
        };

        if (p.friction === 'low') rings.green.items.push(wrapper);
        else if (p.friction === 'medium') rings.yellow.items.push(wrapper);
        else rings.red.items.push(wrapper);
    });

    Object.values(rings).forEach(ring => {
        const ringContainer = document.createElement('div');
        ringContainer.classList.add('orbit-ring');
        ringContainer.style.width = ring.radius * 2 + 'px';
        ringContainer.style.height = ring.radius * 2 + 'px';
        ringContainer.style.animationDuration = ring.speed + 's';

        ring.items.forEach((el, i) => {
            const angle = (i / ring.items.length) * 2 * Math.PI;
            const x = ring.radius * Math.cos(angle);
            const y = ring.radius * Math.sin(angle);
            el.style.position = 'absolute';
            el.style.left = (ring.radius + x - 32) + 'px';
            el.style.top = (ring.radius + y - 32) + 'px';
            ringContainer.appendChild(el);
        });

        orbitMap.appendChild(ringContainer);
    });
});
