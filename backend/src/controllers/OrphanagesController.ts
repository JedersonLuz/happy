import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import orphanageView from '../views/orphanages_view';
import * as Yup from 'yup';

import Orphanage from '../models/Orphanage';

export default {
  async index(req: Request, res: Response) {
    const orphanagesRepository = getRepository(Orphanage);

    const orphanages = await orphanagesRepository.find({
      relations: ['images']
    });

    return res.json(orphanageView.renderMany(orphanages));
  },

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const orphanagesRepository = getRepository(Orphanage);

    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ['images']
    });

    return res.json(orphanageView.render(orphanage));
  },

  async create(req: Request, res: Response) {
    const {
      name,
      latitude,
      longitude,
      instructions,
      about,
      opening_hours,
      open_on_weekend
    } = req.body;
  
    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = req.files as Express.Multer.File[];
    const images = requestImages.map(image => {
      return { path: image.filename }
    });
  
    const data = {
      name,
      latitude,
      longitude,
      instructions,
      about,
      opening_hours,
      open_on_weekend,
      images
    };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      instructions: Yup.string().required(),
      about: Yup.string().required().max(300),
      opening_hours: Yup.string().required(),
      open_on_weekend: Yup.boolean().required(),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required(),
        })
      )
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const orphanage = orphanagesRepository.create(data);
  
    await orphanagesRepository.save(orphanage);
  
    return res.status(201).json(orphanage);
  }
};