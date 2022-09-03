//React imports
import React from 'react'
import { useState, ReactElement, useEffect} from 'react'
import {useRouter} from 'next/router'

//Next.js imports
import Script from 'next/script'
import type { NextPage, GetStaticProps } from 'next'

//Sccs import
import styles from "../styles/VideoPage.module.scss"
import * as Icon from 'react-bootstrap-icons';
import Head from 'next/head'

//Image in Image_selector
//Obsahuje button s funkcí, která změní url adressu, a img
const Image = ({image, change}:any) => {
    return (
        <div className={styles.image}>
            <button onClick={() => change(image)}>
                <img src={image}/>
            </button>
        </div>
    )
}

//Slouži k zobrazení výběru obrázků
const Image_selector = ({images, change}:any) => {
    return (
        <div className={styles.image_selector}>
            {images.map((image:any, index:Number) => <Image key={index} image={image} change={change} />)}
        </div>
    )
}

//Hlavní element

const videoPage:NextPage = ({sessionId, images, playerData}:any) => {
    //Declare variable
    //Změna ve vnitř videa
    const [text, changeText] = useState("")
    const [image, changeImage] = useState("")
    //Router k odchodu ze strany a zničení přehrávače
    const router = useRouter()
    //On open
    useEffect(()=>{
        // přiřazení proměných k přehrávači
        let webPlayerR = document.getElementById(sessionId) as HTMLElement
        //Declare data
        webPlayerR.data = {
            project: {
                'TEXT_0': text,
                "IMAGE_0" : image
            }
        }

        //On back button press
        //Zničení přehrávače
        router.beforePopState(({ url, as, options }) => {
            webPlayerR.destroy()
            return true
        })
    })

    //Funkce
    //Změna textu
    const changeTextF = (e: any) => {
        changeText(e.target.value)
    }
    //Změna obrázků
    const changeImageF = (url: String) => {
        changeImage(url)
    }
    //Back button
    const backButton = (url: String) =>{
        let webPlayerR = document.getElementById(sessionId) as HTMLElement
        if (webPlayerR){
            webPlayerR.destroy()
        }
        router.push('/' + url)
    }

    return (
    <div className={styles.container}>
        <Script src="https://cdn.webout.me/webout-player.42edf2c80b9a18176010.js" defer />
        <Head>
            <title>{playerData.name}</title>
            <link rel="icon" href="/favicon.ico" />
            {!!images[0] && images.map((item:any, index:any) => <link key={index} rel="preload" as="image" href={item}></link>)}
        </Head>
        <header>
            <button onClick={() => backButton("")} title="Zpět"><Icon.ArrowLeft /></button>
            <h1>{playerData.name}</h1>
        </header>

        <main>
            <div className={styles.player_container}>
                <webout-player id={sessionId} className={styles.player} sessionId={sessionId}></webout-player>
            </div>
            <div className={styles.changes_container}>
                <h2>
                    Zkuste si video upravit
                </h2>
                <div>
                    <div className={styles.text_edit}>
                        <h3>
                            Upravte text
                        </h3>
                        <input className={styles.player} placeholder="Upravte text" onChange={changeTextF} />
                    </div>
                    {
                        !!images[0] && 
                        <div>
                            <h3>
                                Změňte obrázek
                            </h3>
                            <Image_selector images={images} change={changeImageF}/>
                        </div>
                    }
                </div>
            </div>
        </main>
    </div>
    )
}

//Exports
//Všechny cesty
export const getStaticPaths = async () => {
    //Získat všechny sessionId videi
    const paths:String[] = await fetch("https://cdn.webout.me/data/projects.json").then(res => {
        if(res.ok){
            return res.json().then(json => {
                return json.map((element:any) => {
                    return {params: {sessionId: element["sessionId"]}}
                });
            })
        }
    })
    return {
        paths,
        fallback: false
    }
}

//Získat props ke stránce
export const getStaticProps: GetStaticProps = async (context) => {
    //sessionId
    const { sessionId }:any = context.params;
    //Images links
    const data: any = await fetch("http://localhost:3000/images.json").then(
            res => {
                if (res.ok){
                    return res.json().then(
                        json => {
                            const imageList:String[] = json["images"][sessionId] || []
                            return imageList
                        }
                    )
                }
                else{
                    return []
                }
            }
        )
    //Data k video (popis, jméno, ...)
    const playerData: any = await fetch("https://cdn.webout.me/data/projects.json").then(
        res => {
            if (res.ok){
                return res.json().then(
                    json => {
                        var resurl: any = null
                        json.forEach((element:any) => {
                            if (element["sessionId"] === sessionId && !resurl){
                                resurl = element
                            }
                        });
                        return resurl
                    }
                )
            }
            else{
                return []
            }
        }
    )
    return {
      props: {
        sessionId,
        images: data,
        playerData: playerData,
      },
    };
  };

export default videoPage