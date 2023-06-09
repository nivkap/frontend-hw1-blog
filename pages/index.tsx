import React, {useRef, useState} from "react";
import type { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from '../lib/prisma'
import { getSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { PageBar } from "../components/PageBar";
import { PageBarForm } from "../components/PageBarForm";


export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageNumber = parseInt((context.query.page as string) || "1");
  const postsPerPage = 10;
  
  const session = await getSession({req: context.req});

  const getCurrentUserID = async () => {
    const user = await prisma.user.findFirst({
      where: {
        email: {equals: session?.user?.email}
      }
    });

    if(user === null) 
      return -1;


    return user.id;
  }
  const postsAmount = await prisma.post.count({
    where: {
      OR:
      [ 
        {published: true},
        {authorId: {equals: await getCurrentUserID()}}
      ]
    },
  });

  const totalNumberOfPages = Math.ceil(postsAmount / postsPerPage);
  
  const feed = await getCurrentPagePosts(pageNumber, await getCurrentUserID())

  return {
    props: { feed, pageNumber, totalNumberOfPages },
  };

};

type Props = {
  feed: PostProps[];
  pageNumber: number;
  totalNumberOfPages: number;
};



const getCurrentPagePosts = async (page:number, sessionUserId: number) => {
  const postsPerPage = 10;
  const content = await prisma.post.findMany({
    orderBy: {
      id: 'asc'
    },
    where: {
      OR:
      [ 
        {published: true},
        {authorId: {equals: sessionUserId}}
      ]
    
    },
    take: postsPerPage * (page - 1)
  })
  .then(posts => {
    if(posts.length === 0) 
      return -1
    return posts[posts.length-1].id
  })
  .then(prevId => prisma.post.findMany({
    orderBy: {
      id: 'asc'
    },
    take: postsPerPage,
    where: {
      OR:
      [ 
        {published: true},
        {authorId: {equals: sessionUserId}}
      ],
      id: {
        gt: prevId
      }
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  }))
  return content;
}  


const Blog: React.FC<Props> = (props) => {
  const router = useRouter();
  const [formPage, setFormPage] = useState(props.pageNumber);
  const { feed, pageNumber, totalNumberOfPages } = props;

  const changePage = (newPage: number) => {
    setFormPage(newPage);
    router.push(`/?page=${newPage}`);
  };

  // Preparing the numbers of the buttons
  const pageNumbers = [];
  const maxVisiblePages = 5; // Number of pages to display before and after the current page
  const minPage = Math.max(1, pageNumber - maxVisiblePages);
  const maxPage = Math.min(totalNumberOfPages, pageNumber + maxVisiblePages);

  const changeFormPage = (formPageChange: React.FormEvent<HTMLInputElement>) => {
    const newFormPage = parseInt(formPageChange.currentTarget.value);
    if(isNaN(newFormPage) || newFormPage < 1 || newFormPage > props.totalNumberOfPages)  {
      return;
    }
    setFormPage(newFormPage)

  }


  for (let i = minPage; i <= maxPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <Layout>
      <div className="page">
        <h1>Public Feed</h1>
        <h2>Page {pageNumber} / {totalNumberOfPages}</h2>
        <main>
          {feed.map((post) => (
            <div key={post.id} className="post">
              <Post post={post} />
            </div>
          ))}
        </main>
        <PageBar totalNumberOfPages={totalNumberOfPages} pageNumber={pageNumber} pageNumbers={pageNumbers} changePage={changePage}/>
        <PageBarForm formPage={formPage} changeFormPage={changeFormPage} changePage={changePage}/>
      </div>
      <style jsx>{`
      .post {
        background: white;
        transition: box-shadow 0.1s ease-in;
      }

      .post:hover {
        box-shadow: 1px 1px 3px #aaa;
      }

      .post + .post {
        margin-top: 2rem;
      }
      
      h2 {
        color: "#FFFFFF";
      }
      `}</style>
    </Layout>
  );
};

export default Blog;