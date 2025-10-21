import React from 'react'

function Home() {
  const benefits = [
    {
      title: '1. Save Money on Commutes',
      content: `Carpooling allows you to split fuel and toll costs with fellow passengers, significantly reducing your daily travel expenses. By sharing rides, you also minimize wear and tear on your vehicle, which helps lower maintenance costs over time.`
    },
    {
      title: '2. Help the Environment',
      content: `Sharing rides means fewer cars on the road, which leads to lower carbon emissions and improved air quality. By choosing carpooling, you actively contribute to reducing pollution and fighting climate change in your community.`
    },
    {
      title: '3. Reduce Traffic Congestion',
      content: `Carpooling decreases the number of vehicles during peak hours, easing traffic jams and making commutes smoother for everyone. Less congestion means less time spent stuck in traffic, increasing productivity and overall satisfaction.`
    },
    {
      title: '4. Build Social Connections',
      content: `Riding together provides a great opportunity to meet new people, network with coworkers, or simply enjoy company during your commute. This social aspect can make daily travel more enjoyable and help you build lasting friendships.`
    },
    {
      title: '5. Enjoy Convenience and Flexibility',
      content: `Modern carpooling platforms offer flexible scheduling options so you can find rides that fit your needs. Whether you commute daily or occasionally, you can customize your travel plans without the hassle of driving alone.`
    },
    {
      title: '6. Reduce Parking Hassles',
      content: `By sharing rides, you can also share parking spaces or avoid parking altogether, saving time and money spent looking for parking in busy areas.`
    },
    {
      title: '7. Lower Vehicle Wear and Tear',
      content: `Driving less frequently means your vehicle experiences less wear, reducing the need for repairs and maintenance and extending its lifespan.`
    },
    {
      title: '8. Increase Safety',
      content: `Traveling with others can enhance safety and security during commutes, especially during early mornings or late nights.`
    },
    {
      title: '9. Support Local Communities',
      content: `Carpooling helps build stronger local communities by connecting neighbors and coworkers, encouraging mutual support and cooperation.`
    },
    {
      title: '10. Reduce Stress',
      content: `Sharing the driving responsibilities and relaxing during the commute can significantly reduce stress and improve your overall well-being.`
    }
  ]

  return (
    <div className="container my-5">
      <h1 className="mb-4 text-center">Welcome to CarPooling</h1>
      <p className="lead text-center mb-5">
        Discover the many benefits of carpooling and how it can improve your daily travel experience.
      </p>

      {/* Scrollable container */}
      <div
        style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}
      >
        {benefits.map(({ title, content }) => (
          <div key={title} className="mb-4">
            <h5>{title}</h5>
            <p className="small">{content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
