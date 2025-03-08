const rawUsernames = await prisma.userid_table.findMany({
            where: {
                username: {
                    contains: SearchUser,  // Substring match (case-sensitive)
                    mode: 'insensitive'    // Makes it case-insensitive
                }
            },
            select: {
                username: true,
            }
        });