//Import Next.js
import type { NextPage } from 'next'
import Link from 'next/link'
import Head from 'next/head'

//Styles import
import styles from '../styles/Home.module.scss'

//React import
import React from 'react'
import { useState } from 'react'

import Card from "react-bootstrap/Card"

//Zobrazení položky videa.
//Položka je uložena v Linku, který přesměruje na stránku s přehrávačem.
//Musí obsahovat Obrázek, Název a popis
const Video = ({video}:any) => {
  return (
    <Link href={"/"+video.sessionId}>
        <Card className={styles.video}>
          <Card.Header className={styles.video_headline}><h2>{video.name}</h2></Card.Header>
          <Card.Img variant="center" src={video.thumbnail} />

          <Card.Body>
            <Card.Text>
              {video.description}
            </Card.Text>
          </Card.Body>
        </Card>
    </Link>
  )
}

//Vstup pro hledání s funkcí, která automaticky zobrazí všechy výsledky.
//Mezi výsledky se počítají všechny názvy, které obsahují vložený sub-string
const SearchBar = ({search}:any) => {
  const onChange = (e:any) => {
      search(e.target.value)
  }

  return (
      <div className={styles.searchBar}>
          <input onChange={onChange} type="text" placeholder='Search'/>
      </div>
  )
}

//Vygenerování videii pomocí .map funkce
const Videos = ({videos}:any) => {
  return (
    <div className={styles.Videos}>
        {videos.map((video:any, index:Number) => <Video key={video.sessionId} video={video} />)}
    </div>
  )
}

//Index page
const Home: NextPage = ({data}:any) => {
  
  //Data, které se zobrazují ve výsledkách
  const [validData, changeValidData] = useState(data)

  //Hledací funkce
  //Funkce projde všechny názvy a zkontroluje jestli obsahují sub-string
  //Funkce nebere ohled na malá a velká písmena
  const search = (search:String) => {
    //Data, které vyhovují vyhledávání
    var searchData:any[] = []

    if (search.length !==0){
      //Konrola všech dat jesli se nerovnají 0
      if (data.length !== 0){
        //Loop s kontrolní úlohou
        data.forEach((item:any) => {
          if (item.name.toLowerCase().includes(search.toLowerCase())){
            searchData.push(item)
          }
        })
      }
    }else{
      searchData = data
    }
    
    //Změnění data, která se zobrazí
    changeValidData(searchData)
  }

  return (
    <div className={styles.container}>

      <Head>
        <title>Webout test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" as="image" href="https://www.webout.me/beta/assets/img/webout_logo_3.png"></link>
        {data.map((item:any, index:any) => <link key={index} rel="preload" as="image" href={item.thumbnail}></link>)}
      </Head>

      <header className={styles.header}>
        <img src="https://www.webout.me/beta/assets/img/webout_logo_3.png" alt="Picture of the author"/>
      </header>

      <main className={styles.main}>
        <SearchBar search={search}/>
        <Videos videos={validData} />
      </main>

      <footer className={styles.footer}>
        
      </footer>
    </div>
  )
}

export async function getStaticProps(context:any) {
  const data:any = await fetch("https://cdn.webout.me/data/projects.json").then(
    res => {
      if (res.ok){
        return res.json().then(
          json => json
        )
      }
      else{
        return []
      }
    }
  )
  return {
    props: {
      data: data,
    }, // will be passed to the page component as props
  }
}

export default Home
