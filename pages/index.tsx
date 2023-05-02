import React, {useRef, useState} from "react";
import type { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from '../lib/prisma'
import { getSession } from "next-auth/react";
import { useRouter } from 'next/router';


export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageNumber = parseInt((context.query.page as string) || "1");
  const postsPerPage = 10;
  const postsAmount = await prisma.post.count({
    where: {
      published: true,
    },
  });

  const totalNumberOfPages = Math.ceil(postsAmount / postsPerPage);
  
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

  const changePage = (newPage: number) => {
    router.push(`/?page=${newPage}`);
  };

  // Prepering the numbers of the buttons
  const pageNumbers = [];

  const changeFormPage = (formPageChange: React.FormEvent<HTMLInputElement>) => {
    const newFormPage = parseInt(formPageChange.currentTarget.value);
    if(isNaN(newFormPage) || newFormPage < 1 || newFormPage > props.totalNumberOfPages)  {
      return;
    }
    setFormPage(newFormPage)

  }


  for (let i = 1; i <= props.totalNumberOfPages; i++) {
    pageNumbers.push(i);
  }


  

  return (
    <Layout>
      <div className="page">
        <h1>Public Feed</h1>
          <h2>Page {props.pageNumber} / {props.totalNumberOfPages}</h2>
          <main>
            {props.feed.map((post) => (
              <div key={post.id} className="post">
                <Post post={post} />
              </div>
            ))}
          </main>
        <nav>
          <ul className="pagination">
            <form onSubmit={(form) => {
              form.preventDefault();
              changePage(formPage);
            }}>
              <label>
                <input type="number" value={formPage} onChange={changeFormPage} />
              </label>
              <input type="submit" value="Go to page" />
            </form>
          </ul> 
        </nav>
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

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
        }
        
        .pagination form {
          display: flex;
          align-items: center;
        }
        
        .pagination label {
          font-size: 18px;
          margin-right: 10px;
        }
        
        .pagination input[type="number"] {
          width: 70px;
          padding: 5px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        
        .pagination input[type="submit"] {
          padding: 5px 10px;
          background-color: #4CAF50;
          color: #fff;
          font-size: 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .pagination input[type="submit"]:hover {
          background-color: #3e8e41;
        }
        
        
      `}</style>
    </Layout>
  );
};

export default Blog;
