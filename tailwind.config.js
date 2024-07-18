/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    fontFamily: {
      Raleway: ['Raleway, sans-serif'],
      Josefin: ['Josefin Slab, sans-serif'],
      Cormorant: ['Cormorant Garamond, sans-serif']
    },
    backgroundImage: {
      banner:
        "linear-gradient(#4c4b4b58, #4c4b4b58),url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80')",
      articles: "url('/assets/img/bgTree.jpg')",
      gallery:
        "url('https://images.unsplash.com/photo-1504870712357-65ea720d6078?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80/')",
      register: "linear-gradient(#4c4c4c93, #4c4c4c93),url('/assets/img/register.jpg')",
      login: "url('/assets/img/login.jpg')",
      avatar: "url('/assets/img/avatar.jpg')"
    },
    animation: {
      circle: 'circle .8s ease forwards',
      deerIcon: 'deerIcon .5s ease forwards .6s',
      circleB: 'circleB .8s ease forwards',
      deerIconB: 'deerIconB .5s ease forwards',
      deerIconActive: 'deerIconActive .8s ease-out forwards',
      line: 'line 1.8s ease forwards',
      lineB: 'lineB 1.2s ease forwards',
      slideInRight: 'slideInRight .6s linear forwards',
      slideInLeft: 'slideInLeft .6s linear forwards',
      slideInRightBack: 'slideInRightBack .7s linear forwards',
      slideInLeftBack: 'slideInLeftBack .6s linear forwards',
      loading: 'loading 3.5s linear infinite',
      bounce1: 'bounce 1.75s linear infinite 250ms',
      bounce2: 'bounce 1.75s linear infinite 500ms',
      bounce3: 'bounce 1.75s linear infinite 750ms',
      bounce4: 'bounce 1.75s linear infinite 1000ms'
    },
    keyframes: {
      circle: {
        '0%': {
          width: '15rem',
          borderColor: '#fff',
          color: '#fff'
        },
        '40%': {
          fontSize: '1rem',
          color: 'transparent',
          border: '3px solid white'
        },
        '100%': {
          width: '5rem',
          height: '5rem',
          borderColor: '#fff',
          color: 'transparent',
          fontSize: '1rem',
          border: '4px solid #ffffffe3'
        }
      },
      deerIcon: {
        '0%': {
          opacity: '0%'
        },
        '50%': {
          opacity: '50%'
        },
        '100%': {
          opacity: '100%'
        }
      },
      circleB: {
        '0%': {
          width: '5rem',
          height: '5rem',
          borderColor: '#fff',
          color: 'transparent',
          fontSize: '1rem',
          border: '4px solid #ffffffe2'
        },
        '60%': {
          fontSize: '1rem',
          color: 'transparent',
          border: '3px solid white'
        },
        '100%': {
          width: '15rem',
          borderColor: '#fff',
          color: '#fff'
        }
      },
      deerIconB: {
        '0%': {
          opacity: '50%'
        },
        '30%': {
          opacity: '0%'
        },
        '100%': {
          opacity: '0%'
        }
      },
      deerIconActive: {
        '0%': {
          opacity: '100%',
          transform: 'scale(1)'
        },
        '100%': {
          opacity: '0%',
          transform: 'scale(5)'
        }
      },
      line: {
        '0%': {
          opacity: '0%',
          width: '50%'
        },
        '30%': {
          opacity: '0%',
          width: '50%'
        },
        '100%': {
          opacity: '100%',
          width: '50vw'
        }
      },
      lineB: {
        '0%': {
          opacity: '100%',
          width: '50vw'
        },
        '60%': {
          opacity: '100%',
          width: '50vw'
        },
        '100%': {
          opacity: '0%',
          width: '50%'
        }
      },
      slideInRight: {
        '0%': {
          transform: 'translateX(100%)',
          opacity: '0'
        },
        '50%': {
          opacity: '0.2'
        },
        '100%': {
          transform: 'translateX(0)',
          opacity: '1'
        }
      },
      slideInRightBack: {
        '0%': {
          transform: 'translateX(0%)',
          opacity: '1'
        },
        '50%': {
          opacity: '0.8'
        },
        '100%': {
          transform: 'translateX(100%)',
          opacity: '0'
        }
      },
      slideInLeft: {
        '0%': {
          transform: 'translateX(-100%)',
          opacity: '0'
        },
        '50%': {
          opacity: '0.2'
        },
        '100%': {
          transform: 'translateX(0)',
          opacity: '1'
        }
      },
      slideInLeftBack: {
        '0%': {
          transform: 'translateX(0%)',
          opacity: '1'
        },
        '50%': {
          opacity: '0.8'
        },
        '100%': {
          transform: 'translate(-100%)',
          opacity: '0'
        }
      },
      loading: {
        '0%': {
          transform: 'rotateZ(0deg)'
        },
        '12.5%': {
          transform: 'rotateZ(0deg)'
        },
        '25%': {
          transform: 'rotateZ(45deg)'
        },
        '37.5%': {
          transform: 'rotateZ(45deg)'
        },
        '50%': {
          transform: 'rotateZ(90deg)'
        },
        '62.5%': {
          transform: 'rotateZ(90deg)'
        },
        '75%': {
          transform: 'rotateZ(135deg)'
        },
        '87.5%': {
          transform: 'rotateZ(135deg)'
        },
        '100%': {
          transform: 'rotateZ(180deg)'
        }
      },
      bounce: {
        '0%': {
          opacity: '1',
          width: '.75rem',
          height: '.75rem'
        },
        '50%': {
          opacity: '.5'
        },
        '100%': {
          opacity: '0',
          width: '.5rem',
          height: '.5rem'
        }
      }
    },
    plugins: []
  },
  important: true,
}
